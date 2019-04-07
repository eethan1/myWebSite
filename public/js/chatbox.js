socket = io.connect('ws://localhost:3001');
socket.on('message', (obj)=>{
    console.log("receive:",obj);
    appendMsg(obj);
});
var msgCnt = 0
var appendMsg = function(obj){
    var msg = obj.msg;
    var node = document.getElementById('msgBox');
    var pNode = document.createElement('p');
    pNode.id = obj.id;
    msgCnt++;
    pNode.innerHTML = msg;
    pNode.value = true;
    console.log(pNode);
    pNode.onclick = deleteMsg(pNode.id);
    node.appendChild(pNode);
    console.log("append:",msg);
}
var deleteMsg = function(id){
    return function(){
        var ele = document.getElementById(id);
        console.log(id);
        $.ajax({
            url: '/msg',
            type: 'DELETE',
            data:{
                _id:id
            },
            success: (res) => {
                console.log(res);
                if(res.code===200)
                    ele.remove();
                else
                    alert('You cannot do that!');
            }
        });
    }
}
var sendMsg = function(event){
    if(event.keyCode != 13) {
        return false;
    }
    var msg = document.getElementById('msgInput').value;
    console.log("send: ",msg);
    $.post({
        url: '/msg',
        type:'POST',
        data: {
            msg:msg,
        },
        error: (xhr) => {
            console.log(xhr, 'error');
        },
        success: (res) => {
            console.log(res);
        }
    });
}

