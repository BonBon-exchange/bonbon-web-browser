/* eslint-disable consistent-return */
/* eslint-disable import/no-cycle */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
import { app, session } from 'electron';
import contextMenu from 'electron-context-menu';
import path from 'path';

import { event } from './analytics';
import { makeAssociation } from './association';
import {
  createWindow,
  getMainWindow,
  getSelectedView,
  setBrowserViewBonds,
} from './browser';
import {
  getExtensionsObject,
  installAndLoadUserExtensions,
  makeChromeExtensionSupport,
} from './extensions';
import i18n from './i18n';
import {
  addPermissionCallback,
  getBrowsers,
  getCertificateErrorAuth,
  getPermissionCallback,
  makeIpcMainEvents,
} from './ipcMainEvents';
import { isValidUrl } from './util';

let urlToOpen: string | undefined;

export const setUrlToOpen = (url: string | undefined) => {
  urlToOpen = url;
};
export const getUrlToOpen = () => urlToOpen;

const getUrlInArgv = (argv: string[]) => {
  if (argv.length > 0 && isValidUrl(argv[argv.length - 1])) {
    return argv[argv.length - 1];
  }
  return undefined;
};

const downloadItemEventAction = (
  item: Electron.DownloadItem,
  state: string
) => {
  if (item.getSavePath()) {
    getMainWindow()?.webContents.send('download-state', state);
    getSelectedView()?.webContents.send('downloading', {
      savePath: item.getSavePath(),
      filename: item.getFilename(),
      progress: item.getReceivedBytes() / item.getTotalBytes(),
      etag: item.getETag(),
      startTime: item.getStartTime(),
      state,
    });
  }
};

const makeAppEvents = () => {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) app.quit();

  app.on('second-instance', (_e, argv) => {
    const mainWindow = getMainWindow();
    if (argv.length > 0 && isValidUrl(argv[argv.length - 1])) {
      const selectedView = getSelectedView();
      selectedView?.webContents.send('new-window', {
        url: argv[argv.length - 1],
      });

      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    }
  });

  app.on('open-url', (_e, url) => {
    const mainWindow = getMainWindow();
    const selectedView = getSelectedView();
    if (isValidUrl(url)) selectedView?.webContents.send('new-window', { url });
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('window-all-closed', () => {
    event('close_app');
    app.quit();
  });

  app.on('web-contents-created', (_event, contents) => {
    const extensions = getExtensionsObject();

    contents.on('enter-html-full-screen', () => {
      const view = getSelectedView();
      if (view) setBrowserViewBonds(view, true);
    });

    contents.on('leave-html-full-screen', () => {
      const view = getSelectedView();
      if (view) setBrowserViewBonds(view, false);
    });

    contents.on('new-window', (e, url) => {
      e.preventDefault();
      const selectedView = getSelectedView();
      selectedView?.webContents.send('new-window', { url });
    });

    contents.on('will-attach-webview', (wawevent) => {
      const pathToPreloadScipt = app.isPackaged
        ? path.join(__dirname, '../../../assets/webview-preload.js')
        : path.join(__dirname, '../../assets/webview-preload.js');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      wawevent.sender.session.setPreloads([`${pathToPreloadScipt}`]);
    });

    contents.on('did-attach-webview', (_daw, webContents) => {
      getBrowsers()[webContents.id] = webContents;
      webContents.addListener('dom-ready', () => {
        if (webContents.getURL() === 'https://web.whatsapp.com/') {
          webContents.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
          );
        } else {
          webContents.setUserAgent('');
        }

        webContents.send('created-webcontents', {
          webContentsId: webContents.id,
        });
      });

      const mainWindow = getMainWindow();
      if (mainWindow) extensions.addTab(webContents, mainWindow);

      webContents.on(
        'certificate-error',
        (_e, _url, _error, certificate, callback) => {
          const isTrusted = getCertificateErrorAuth(
            webContents.id,
            certificate.fingerprint
          );
          callback(isTrusted);
          if (!isTrusted) {
            getSelectedView()?.webContents.send('certificate-error', {
              webContentsId: webContents.id,
              fingerprint: certificate.fingerprint,
            });
          }
        }
      );

      webContents.session.on('will-download', (_e, item, _wc) => {
        item.on('updated', (_ei, state) => {
          downloadItemEventAction(item, state);
        });
        item.on('done', (_ei, state) => {
          downloadItemEventAction(item, state);
        });
      });

      contextMenu({
        prepend: () => [
          {
            label: i18n.t('Set as default window size'),
            click: () => {
              contents.send('set-default-window-size', webContents.id);
            },
          },
          {
            label: i18n.t('Distribute windows evenly'),
            click: () => {
              contents.send('distribute-windows-evenly');
            },
          },
        ],
        window: webContents,
        showInspectElement: true,
        showSearchWithGoogle: false,
        showCopyImageAddress: true,
      });
    });
  });
};

app
  .whenReady()
  .then(() => {
    makeAssociation();
    makeChromeExtensionSupport();
    makeIpcMainEvents();
    makeAppEvents();
    installAndLoadUserExtensions();
    createWindow()
      .then(() => {
        getMainWindow()
          ?.webContents.executeJavaScript(`localStorage.getItem("i18nextLng");`)
          .then((locale) => {
            if (locale) i18n.changeLanguage(locale);
          });

        setUrlToOpen(getUrlInArgv(process.argv));

        session
          .fromPartition('persist:user-partition')
          .setPermissionRequestHandler((webContents, permission, callback) => {
            const originalUrl = webContents.getURL();
            if (
              originalUrl === 'http://localhost:1212/index.html' ||
              permission === 'fullscreen'
            ) {
              return callback(true);
            }

            try {
              const urlInfo = new URL(originalUrl);
              const url = urlInfo.origin;

              const permCallback = getPermissionCallback(url, permission);
              if (permCallback) permCallback(true);
              else {
                getSelectedView()?.webContents.send('permission-request', {
                  url,
                  permission,
                  webContentsId: webContents.id,
                });

                addPermissionCallback(url, permission, callback);
              }
            } catch (e) {
              console.log(e);
            }
          });

        const mainWindow = getMainWindow();

        if (mainWindow) {
          const extensions = getExtensionsObject();
          extensions.addTab(mainWindow.webContents, mainWindow);
          extensions.selectTab(mainWindow.webContents);

          if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
          } else {
            mainWindow.show();
            if (process.platform !== 'darwin') {
              mainWindow.maximize();
            }
          }
        }

        if (!app.isPackaged)
          mainWindow?.webContents.openDevTools({ mode: 'detach' });
      })
      .catch(console.log);

    app.on('activate', () => {
      const mainWindow = getMainWindow();
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
