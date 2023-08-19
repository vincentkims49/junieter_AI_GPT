import { useState } from "react";
import Title from "./Title";
import RecordMessage from "./RecordMessage";
import axios from "axios";

function Controller() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const createBlobUrl = (data: any) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    // Append recorded message to messages
    const myMessage = { sender: "me", blobUrl };
    const messageArr = [...messages, myMessage];

    // Convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Construct audio to send file
        const formData = new FormData();
        formData.append("file", blob, "myfile.wav");

        // Send form data to API endpoint
        await axios
          .post("http://localhost:8000/post-audio", formData, {
            headers: { "Content-Type": "audio/mpeg" },
            responseType: "arraybuffer",
          })
          .then((res: any) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobUrl(blob);

            // Append to  audio
            const junieterMessage = { sender: "junieter", blobUrl: audio.src };
            messageArr.push(junieterMessage);
            setMessages(messageArr);

            // Play Audio
            setIsLoading(false);
            audio.play();
          })
          .catch((err) => {
            console.error(err.message);
            setIsLoading(false);
          });
      });
  };

  return (
    <div className="h-screen overflow-y-hidden">
      <Title setMessages={setMessages} />
      <div className=" flex flex-col justify-between h-full overflow-scroll pb-96 bg-gradient-to-t from-purple-200 to-purple-400">
        {/* Conversation */}
        <div className="mt-5 px-5">
          {messages.map((audio, index) => {
            return (
              <div
                key={index + audio.sender}
                className={
                  "flex flex-col " +
                  (audio.sender == "junieter" && "flex items-end")
                }
              >
                {/* Sender */}
                <div className="mt-4">
                  <p
                    className={
                      audio.sender == "junieter"
                        ? "text-right mr-2 italic text-purple-900"
                        : "ml-2 italic text-blue-900"
                    }
                  >
                    {audio.sender}
                  </p>

                  {/* Audio Message */}
                  <audio
                    src={audio.blobUrl}
                    className="appearance-none"
                    controls
                  ></audio>
                </div>
              </div>
            );
          })}

          {messages.length == 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">
              Send Junieter a message...
            </div>
          )}

          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">
              Give me a sec...
            </div>
          )}
        </div>
        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-b from-purple-300 to-purple-400">
          <div className="flex justify-center items-center w-full">
            <RecordMessage handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller;
