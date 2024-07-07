
import { CustomDataProvider } from "../dataProvider";
import { DialogWindow } from "./sendMessageBox";
import {
  useRecordContext,
  useRefresh,
  useDataProvider,
  useNotify,
  useTranslate,
} from "react-admin";


export default function SendMessageDialog() {
  const dataProvider = useDataProvider() as CustomDataProvider;
  const translate = useTranslate();
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();

  const sendMessage = async (message: string, setOpen: (v: boolean) => void) => {
    dataProvider
      .sendMessage("send-message", {
        message,
        data: [{ userId: record["id"].toString(), chatId: record["telegram"] }],
      })
      .then((res) => {
        if (res.status) {
          notify(translate(`server.res.${res.status}`));
        }
        if (res.ok) {
          setOpen(false);
          refresh();
        }
      })
      .catch((e) => {
        console.error(e);
        notify(translate('server.res.400'));
      });
  };

  return (
    <DialogWindow sendMessage={sendMessage} buttonLabel={''} />
  );
}
