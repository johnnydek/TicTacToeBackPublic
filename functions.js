const crypto = require('crypto')


const generateRandomString = () => {
    const length = 22;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  };

  function getColorBrightness(color) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
  
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
    return brightness;
  }


  module.exports ={
    generateRandomString,
    getColorBrightness
  }


