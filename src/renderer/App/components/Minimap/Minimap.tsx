/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable import/prefer-default-export */
import {
  ReactEventHandler,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useBoard } from 'renderer/App/hooks/useBoard';
import icon from 'renderer/App/images/icon.png';
import loadingImg from 'renderer/App/images/loading.svg';

import { MiniWindow, MiniView, MinimapProps } from './Types';

import './style.scss';

export const Minimap: React.FC<MinimapProps> = ({
  handleHide,
}: MinimapProps) => {
  const board = useBoard();
  const [windows, setWindows] = useState<MiniWindow[]>([]);
  const [view, setView] = useState<MiniView>({
    top: 0,
    height: 100,
  });
  const [showView, setShowView] = useState<boolean>(true);
  const hideTimeout = useRef<any>();

  const minimapContainer = document.querySelector('#Minimap__container');
  const boardContainer = document.querySelector('#Board__container');

  const handleImageError: ReactEventHandler<HTMLImageElement> = (e) => {
    const target = e.target as HTMLImageElement;
    target.src = icon;
  };

  const makeMiniWindows = useCallback((sorted: MiniWindow[]) => {
    return sorted.map((w) => {
      return (
        <motion.div
          className="Minimap__window"
          style={{
            height: `${w.height}px`,
            width: `${w.width}px`,
            top: `${w.top}px`,
            left: `${w.left}px`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={`miniwindow_${w.id}`}
        >
          <img
            src={w.capture || (w.isLoading ? loadingImg : w.favicon || icon)}
            className="Minimap__browserFavImg"
            onError={handleImageError}
          />
        </motion.div>
      );
    });
  }, []);

  const prepareView = useCallback(() => {
    if (minimapContainer && boardContainer) {
      const top = window.scrollY;
      const ratioY =
        minimapContainer.clientHeight / boardContainer.clientHeight;

      const height = minimapContainer.clientHeight * ratioY;
      setView({ top: top * ratioY, height });
    }
  }, [boardContainer, minimapContainer]);

  const prepareMiniWindows = useCallback(() => {
    if (minimapContainer && boardContainer) {
      const ratioX = minimapContainer.clientWidth / boardContainer.clientWidth;
      const ratioY =
        minimapContainer.clientHeight / boardContainer.clientHeight;
      const tmpWindows = board.browsers.map((b) => {
        return {
          id: b.id,
          height: b.height * ratioY,
          width: b.width * ratioX,
          top: b.top * ratioY,
          left: b.left * ratioX,
          favicon: b.favicon,
          isLoading: b.isLoading,
          capture: b.capture,
        };
      });
      const toSort = [...tmpWindows];
      const sorted = toSort.sort((a, b) => {
        return a.id > b.id ? 1 : -1;
      });
      setWindows(sorted);
    } else {
      setWindows([]);
    }
  }, [board.browsers, minimapContainer, boardContainer]);

  const mouseMoveWithClickHandler = useCallback(
    (e: any) => {
      if (minimapContainer && boardContainer) {
        const ratioY =
          minimapContainer.clientHeight / boardContainer.clientHeight;

        const top = Math.max(e.y - view.height / 2, 0);

        setView({ top, height: view.height });
        window.scrollTo(0, top / ratioY);
      }
    },
    [boardContainer, minimapContainer, view.height]
  );

  const mouseUpHandler = useCallback(() => {
    minimapContainer?.removeEventListener(
      'mousemove',
      mouseMoveWithClickHandler
    );
  }, [mouseMoveWithClickHandler, minimapContainer]);

  const mouseEnterHandler = useCallback(() => {
    if (minimapContainer && boardContainer) {
      prepareView();
      prepareMiniWindows();
      setShowView(true);
    }
  }, [boardContainer, minimapContainer, prepareMiniWindows, prepareView]);

  const mouseLeaveHandler = useCallback(() => {
    setShowView(false);
  }, []);

  const clickHandler = useCallback(
    (e: any) => {
      if (minimapContainer && boardContainer) {
        const ratioY =
          minimapContainer.clientHeight / boardContainer.clientHeight;

        const top = Math.max(e.y - view.height / 2, 0);
        const height = minimapContainer.clientHeight * ratioY;

        setView({ top, height });
        window.scrollTo(0, top / ratioY);

        minimapContainer?.addEventListener(
          'mousemove',
          mouseMoveWithClickHandler
        );
      }
    },
    [view.height, minimapContainer, boardContainer, mouseMoveWithClickHandler]
  );

  const mouseMoveHandler = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => handleHide(), 1000);
  }, [handleHide]);

  const scrollHandler = useCallback(() => {
    prepareView();
  }, [prepareView]);

  useEffect(() => {
    prepareMiniWindows();
  }, [
    board.browsers,
    boardContainer,
    minimapContainer,
    prepareMiniWindows,
    board.isFullSize,
    board.height,
  ]);

  useEffect(() => {
    if (minimapContainer && boardContainer) {
      const ratioY =
        minimapContainer.clientHeight / boardContainer.clientHeight;
      const height = minimapContainer.clientHeight * ratioY;
      setView({ top: 0, height });
    }
  }, [boardContainer, minimapContainer]);

  useEffect(() => {
    minimapContainer?.addEventListener('mousemove', mouseMoveHandler);
    return () =>
      minimapContainer?.removeEventListener('mousemove', mouseMoveHandler);
  }, [mouseMoveHandler, minimapContainer]);

  useEffect(() => {
    minimapContainer?.addEventListener('mousedown', clickHandler);
    return () =>
      minimapContainer?.removeEventListener('mousedown', clickHandler);
  }, [clickHandler, minimapContainer]);

  useEffect(() => {
    minimapContainer?.addEventListener('mouseenter', mouseEnterHandler);
    return () =>
      minimapContainer?.removeEventListener('mouseenter', mouseEnterHandler);
  }, [mouseEnterHandler, minimapContainer]);

  useEffect(() => {
    minimapContainer?.addEventListener('mouseleave', mouseLeaveHandler);
    return () =>
      minimapContainer?.removeEventListener('mouseleave', mouseLeaveHandler);
  }, [mouseLeaveHandler, minimapContainer]);

  useEffect(() => {
    window.addEventListener('mouseup', mouseUpHandler);
    return () => window.removeEventListener('mouseup', mouseUpHandler);
  }, [mouseUpHandler]);

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [scrollHandler]);

  useEffect(() => {
    mouseEnterHandler();
  }, [mouseEnterHandler]);

  useEffect(() => {
    return () => mouseUpHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="Minimap__container">
      {showView && (
        <div
          id="Minimap__view"
          style={{ top: view.top, height: view.height }}
        />
      )}
      <AnimatePresence>{makeMiniWindows(windows)}</AnimatePresence>
    </div>
  );
};
