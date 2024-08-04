import { createPortal } from 'react-dom';

export default ({ tag, children }: { tag?: () => string; children: any }) => {
  let escapehost = document.createElement('_') as HTMLElement;

  try {
    if (tag) {
      escapehost = document.createElement(tag());
    }
  } catch (res) {
    escapehost = document.createElement('_') as HTMLElement;
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return createPortal(children, document.body.appendChild(escapehost));
  }
};
