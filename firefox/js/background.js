function onBeforeRequest(details) {
  const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);
  feito = false;

  if(feito == true){return;}
  if (match !== null && match.length > 1) {
      return new Promise(resolve => {                    
                  fetch(
                      'https://much.ga/on',
                      {
                        method: 'GET',
                      }).then(r =>{
                          if (r.status == 200) {
                              console.log(r.status)
                              feito = true;
                              resolve({redirectUrl: `https://much.ga/channel/${match[1]}`});
                          }else{
                              feito = true;
                              console.log("server off")
                              resolve({});
                          }
                      }).catch((error) => {
                          feito = true;
                          console.log("server off")
                          resolve({});
                      });
          });
      }
  }

browser.webRequest.onBeforeRequest.addListener(onBeforeRequest, {urls: [ "https://usher.ttvnw.net/api/channel/hls/*"] },["blocking"]);