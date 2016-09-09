// import $ from './lib/jquery';

const NavModel = {};

NavModel.changeChannel = (channelId) => {
  const channelUrl = `/channel/${
    channelId === 1 ||
    channelId === 2 ||
    channelId === 3
    ? channelId
    : 'default'
  }`;
  return $.ajax({
    url: channelUrl,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

NavModel.getChannelInfo = () => {
  return $.ajax({
    url: '/channelInfo',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export default NavModel;
