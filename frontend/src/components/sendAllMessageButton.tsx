import { CustomDataProvider } from "../dataProvider";
import { DialogWindow } from "./sendMessageBox";
import {
  useNotify,
  useDataProvider,
  useTranslate,
} from "react-admin";


export default function BulkSendMessageButton() {
  const dataProvider = useDataProvider() as CustomDataProvider;
  const translate = useTranslate();
  const notify = useNotify();

  const sendMessage = async (message: string, setOpen: (v: boolean) => void) => {
    if (!message) return;

    dataProvider
      .sendMessage("send-message", {
        message,
      })
      .then((res) => {
        if (res.status) {
          notify(translate(`server.res.${res.status}`));
        }
        if (res.ok) {
          setOpen(false);
        }
      })
      .catch((e) => {
        console.error(e);
        notify(translate('server.res.400'));
      });
  };

  return (
    <DialogWindow sendMessage={sendMessage} buttonLabel={'custom.action.bulkSendMessage'} />
  );
}
