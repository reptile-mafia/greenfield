//get video description
export const getDescription = (videoId) =>
  $.ajax({
    url: `/test/${videoID}`
    method:'GET',
    headers: {
      'content-Type':'application/json',
    },
  });