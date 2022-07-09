import "./style.css";

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
      frame.contentWindow.postMessage({ type: "init" }, "*", ports)
    );

    dialog.appendChild(frame);
    document.body.appendChild(dialog);

    dialog.showModal();
  });
}

export function closeIFrameDialog(value, ports) {
  const message = { type: "close", value };

  for (const port of ports) {
    port.postMessage(message);
  }
}

function createElements(options) {
  const dialog = document.createElement("dialog");
  const frame = document.createElement("iframe");
  const style = options?.style ?? {
    dialog: "dialog",
    frame: "frame",
  };

  dialog.className = style.dialog;
  frame.className = style.frame;
  frame.src = options.src;

  return { dialog, frame };
}
