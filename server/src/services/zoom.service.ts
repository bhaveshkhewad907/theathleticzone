import axios from "axios";

const getZoomAccessToken = async () => {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;

  // 🛡️ THE FIX: Zoom strictly requires credentials in the body, not the URL
  const tokenUrl = "https://zoom.us/oauth/token";
  const auth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString(
    "base64",
  );

  const params = new URLSearchParams();
  params.append("grant_type", "account_credentials");
  params.append("account_id", ZOOM_ACCOUNT_ID as string);

  const res = await axios.post(tokenUrl, params, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data.access_token;
};

export const createZoomMeeting = async (topic: string, startTime: Date) => {
  const token = await getZoomAccessToken();

  const res = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic: `AZ Deployment: ${topic}`,
      type: 2,
      start_time: startTime.toISOString(),
      duration: 60,
      settings: {
        join_before_host: true,
        waiting_room: false,
        mute_upon_entry: true,
      },
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data.join_url;
};
