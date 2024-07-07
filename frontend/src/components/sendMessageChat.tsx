import { useState } from "react";
import { TextField } from "@mui/material";
import {
  useRecordContext,
  useRefresh,
  useNotify,
  useDataProvider,
  Button,
  useTranslate,
} from "react-admin";
import { CustomDataProvider } from "../dataProvider";

export default function SendMessage() {
  const translate = useTranslate();
  const dataProvider = useDataProvider() as CustomDataProvider;
  const [message, setMessage] = useState("");
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();

  const sendMessage = async () => {
    if (!message) return;

    dataProvider
      .sendMessage("send-message", {
        message,
        data: [{ userId: record["id"].toString(), chatId: record["telegram"] }],
      })
      .then((res) => {
        if (res.status) {
          notify(translate(`server.res.${res.status}`));
          if (res.ok) {
            setMessage("");
            refresh();
          }
        }
      })
      .catch((e) => {
        console.error(e);
        notify(translate('server.res.400'));
      });
  };

  return (
    <>
      <TextField
        id="outlined-password-input"
        label={translate('custom.labels.message')}
        value={message}
        placeholder={translate('custom.labels.writeMessage')}
        fullWidth
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button label='custom.action.sendMessage' variant="contained" onClick={sendMessage} />
    </>
  );
}
