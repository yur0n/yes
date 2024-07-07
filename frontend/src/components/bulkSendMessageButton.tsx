import { CustomDataProvider } from "../dataProvider";
import { DialogWindow } from "./sendMessageBox";
import {
  useListContext,
  useRefresh,
  useNotify,
  useUnselect,
  useUnselectAll,
  useDataProvider,
  useTranslate,
} from "react-admin";


export default function BulkSendMessageButton() {
  const dataProvider = useDataProvider() as CustomDataProvider;
  const { selectedIds, data, resource } = useListContext();
  const translate = useTranslate();
  const unselect = useUnselect(resource);
  const refresh = useRefresh();
  const notify = useNotify();
  const unselectAll = useUnselectAll("users");

  const usersToSend: { userId: any; chatId: any }[] = [];

  data.forEach((user) => {
    if (selectedIds.includes(user.id)) {
      usersToSend.push({ userId: user.id, chatId: user.telegram });
    }
  });

  const sendMessage = async (message: string, setOpen: (v: boolean) => void) => {
    if (!message) return;

    dataProvider
      .sendMessage("send-message", {
        message,
        data: usersToSend,
      })
      .then((res) => {
        if (res.status) {
          notify(translate(`server.res.${res.status}`));
        }
        if (res.ok) {
          setOpen(false);
          unselectAll();
        } else {
          const toUnselect = res.result
            .filter((r) => r.delivered)
            .map((r) => r.id);
          unselect(toUnselect);
        }
      })
      .catch((e) => {
        console.error(e);
        notify(translate('server.res.400'));
      });

    refresh();
  };

  return (
    <DialogWindow sendMessage={sendMessage} buttonLabel={'custom.action.bulkSendMessage'} />
  );
}
