import { useState } from "react";
import { Button, useTranslate } from "react-admin";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";


export const DialogWindow = ({ sendMessage, buttonLabel }: {
	sendMessage: (message: string, setOpen: (v: boolean) => void) => void;
	buttonLabel: string;
}) => {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const translate = useTranslate();

	const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

	return (
    <>
      <Button label={buttonLabel} onClick={handleClickOpen}>
        <SendIcon />
      </Button>
      <Dialog
        maxWidth="xl"
        open={open}
        onClose={handleClose}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title">{translate("custom.action.sendMessage")}</DialogTitle>
        <DialogContent>
          <TextField
            id="outlined-basic"
            label={translate("custom.labels.message")}
            variant="outlined"
            multiline
            rows={4}
            style={{ width: "500px" }}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button label='custom.action.cancel' variant="contained" onClick={handleClose} />
          <Button label='custom.action.send' variant="contained" onClick={() => sendMessage(message, setOpen)} />
        </DialogActions>
      </Dialog>
    </>
  );
}