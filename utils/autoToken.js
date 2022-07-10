
const axios = require('axios')


 function postTokenAuto(token) {

    let payload = { secret_key: process.env.AWS_AUTODRAW_KEY, token: `${token}`};
    axios.post(`${process.env.AWS_AUTODRAW_SERVER}//insert_token`, payload).then(result => {
    // display respons    
    //console.log(result.data);
   });
  }


  function delTokenAuto(token) {
    
    let payload = { secret_key: process.env.AWS_AUTODRAW_KEY, token: `${token}`};

    axios.delete(`${process.env.AWS_AUTODRAW_SERVER}//delete_token`, {data: payload}).then(result => {
    // display respons    
    //console.log(result.data);
   });
  }





exports.postTokenAuto = postTokenAuto;
exports.delTokenAuto = delTokenAuto
