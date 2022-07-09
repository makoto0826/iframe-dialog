import "./style.css";

/**
 * @typedef DialogRect
 * @property {number} top
 * @property {number} left
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef OpenIFrameDialogOptions
 * @property {string} src
 * @property {any} params
 * @property {DialogRect?} rect
 * @property {Array<MessagePort>?} ports
 */

/**
 * @param {OpenIFrameDialogOptions} options
 */
export function openIFrameDialog(options) {
  return new Promise((resolve) => {
    const channel = new MessageChannel();

    const ports = [...(options.ports ?? []), channel.port2];
    const { dialog, frame } = createElements(options);

    channel.port1.onmessage = (e) => {
      if (e.data.type === "close") {
        dialog.close();
        resolve(e.data.value);
      }
    };

    dialog.addEventListener("close", () => document.body.removeChild(dialog));
    frame.addEventListener("load", () =>
      frame.contentWindow.postMessage(
        { type: "init", params: options.params },
        "*",
        ports
      )
    );

    dialog.appendChild(frame);
    document.body.appendChild(dialog);

    dialog.showModal();
  });
}

/**
 * @param {any} value
 * @param {Array<MessagePort>} ports
 */
export function closeIFrameDialog(value, ports) {
  const message = { type: "close", value };

  for (const port of ports) {
    port.postMessage(message);
  }
}

const DIALOG_RECT_NAME_LIST = ["top", "left", "width", "height"];
const DIALOG_CSS = "iframe-dialog__dialog";
const DIALOG_SHADOW_CSS = "iframe-dialog__dialog--shadow";
const IFRAME_CSS = "iframe-dialog__iframe";

/**
 * @param {OpenIFrameDialogOptions} options
 */
function createElements(options) {
  const { src, rect } = options;

  const dialog = document.createElement("dialog");
  const frame = document.createElement("iframe");

  dialog.classList.add(DIALOG_CSS);
  frame.classList.add(IFRAME_CSS);
  frame.src = src;

  if (rect) {
    DIALOG_RECT_NAME_LIST.forEach((name) => {
      dialog.style[name] = `${rect[name]}px`;
    });

    dialog.classList.add(DIALOG_SHADOW_CSS);
  }

  return { dialog, frame };
}
