
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Auth APIs
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return response.data;
};

export const register = async (email, username, password) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, { email, username, password });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post(`${API_URL}/api/auth/logout`);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/api/auth/me`);
  return response.data;
};

// Guild APIs
export const fetchGuilds = async () => {
  const response = await axios.get(`${API_URL}/api/guilds`);
  return response.data;
};

export const fetchGuild = async (guildId) => {
  const response = await axios.get(`${API_URL}/api/guilds/${guildId}`);
  return response.data;
};

export const createGuild = async (guildData) => {
  const response = await axios.post(`${API_URL}/api/guilds`, guildData);
  return response.data;
};

export const updateGuild = async (guildId, guildData) => {
  const response = await axios.put(`${API_URL}/api/guilds/${guildId}`, guildData);
  return response.data;
};

export const deleteGuild = async (guildId) => {
  const response = await axios.delete(`${API_URL}/api/guilds/${guildId}`);
  return response.data;
};

export const createInvite = async (guildId) => {
  const response = await axios.post(`${API_URL}/api/guilds/${guildId}/invites`);
  return response.data;
};

export const getInvite = async (inviteCode) => {
  const response = await axios.get(`${API_URL}/api/invites/${inviteCode}`);
  return response.data;
};

export const acceptInvite = async (inviteCode) => {
  const response = await axios.post(`${API_URL}/api/invites/${inviteCode}/accept`);
  return response.data;
};

// Channel APIs
export const fetchChannels = async (guildId) => {
  const response = await axios.get(`${API_URL}/api/guilds/${guildId}/channels`);
  return response.data;
};

export const fetchChannel = async (guildId, channelId) => {
  const response = await axios.get(`${API_URL}/api/guilds/${guildId}/channels/${channelId}`);
  return response.data;
};

export const createChannel = async (guildId, channelData) => {
  const response = await axios.post(`${API_URL}/api/guilds/${guildId}/channels`, channelData);
  return response.data;
};

export const updateChannel = async (guildId, channelId, channelData) => {
  const response = await axios.put(`${API_URL}/api/guilds/${guildId}/channels/${channelId}`, channelData);
  return response.data;
};

export const deleteChannel = async (guildId, channelId) => {
  const response = await axios.delete(`${API_URL}/api/guilds/${guildId}/channels/${channelId}`);
  return response.data;
};

// Message APIs
export const fetchMessages = async (type, id) => {
  let url;
  if (type === "channel") {
    url = `${API_URL}/api/channels/${id}/messages`;
  } else if (type === "directMessage") {
    url = `${API_URL}/api/direct-messages/${id}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

export const sendMessage = async (messageData) => {
  let url;
  if (messageData.type === "channel") {
    url = `${API_URL}/api/channels/${messageData.channelId}/messages`;
  } else if (messageData.type === "directMessage") {
    url = `${API_URL}/api/direct-messages`;
  }
  
  const response = await axios.post(url, messageData);
  return response.data;
};

// Friends APIs
export const fetchFriends = async () => {
  const response = await axios.get(`${API_URL}/api/friends`);
  return response.data;
};

export const sendFriendRequest = async (username) => {
  const response = await axios.post(`${API_URL}/api/friends/requests`, { username });
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await axios.post(`${API_URL}/api/friends/requests/${requestId}/accept`);
  return response.data;
};

export const rejectFriendRequest = async (requestId) => {
  const response = await axios.post(`${API_URL}/api/friends/requests/${requestId}/reject`);
  return response.data;
};

// Direct Messages APIs
export const fetchDirectMessages = async () => {
  const response = await axios.get(`${API_URL}/api/direct-messages`);
  return response.data;
};
