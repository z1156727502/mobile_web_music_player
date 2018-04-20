function getData(url) {
    $.ajax({
        type: 'GET',
        url: url,
        // data: '',
        success : outData,
        error : outData
    })
}
function outData(data){
    console.log(data);
}
getData('./source/data.json');