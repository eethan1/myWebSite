var vm = new Vue({
    el:'#opt-form',
    data: {
        regions: [],
        weathers: []
    }
});
var result = new Vue({
    el:'#result > p',
    data: {result:''}
});
var rangeForm = new Vue({
    el:'#range-form',
    data: {
        money:100,
        preference:50,
    }
})
$.ajax({
    url: '/api/restaurant/infos',
    type: 'GET',
    dataType: 'json',
    success: (res) => {
        console.log(res);
        vm.$data.regions = res.regions;
        vm.$data.weathers = res.weathers;
    }
}).then(()=>{
    vm.$el.children[0].selected = true;
});

function submitQuery() {
    var status = $('form')[0].method;
    console.log('method: ' + status);
    if(status == 'get') {
        getRestaurant();
    }else if(status == 'post') {
        addRestaurant();
    }
}
function altForm() {
    result.$data.result = '';
    var status = $('form')[0].method;
    event.preventDefault();
    if( status == 'get') {
        $('form')[0].method = 'post';
        $('#add-form').show();
        $('#act-btn').text('Add!');
        $('#alt-btn').text('Search?');
    }else if( status == 'post') {
        $('form')[0].method = 'get';
        $('#add-form').hide();
        $('#act-btn').text('Search!');
        $('#alt-btn').text('Add?');
    }
}

function getRestaurant() {
    console.log('getRestaurant!');
    var query = $('form').serialize();
    console.log(query);
    event.preventDefault();
    $.ajax({
        url: '/api/restaurant',
        type: 'GET',
        data:{q:query,c:{n:10,skip:0}},
        success: (res,textStatus) => {
            console.log(textStatus);
            console.log(res);
            if(res.length == 0){
                result.$data.result = "Nothing to be found."
            } 
            result.$data.result = res[Math.floor(Math.random()*res.length)].name;
        },
        error: (xhr,textStatus, err) => {
            console.log(textStatus);
            console.log(xhr.status);
            console.log(err);
            result.$data.result = 'Something Wrong<br>Forgive me ii';
        }
    });
}

function addRestaurant() {
    console.log('addRestaurant!');
    var query = $('form').serialize();
    console.log(query);
    event.preventDefault();
    $.ajax({
        url: '/api/restaurant',
        type: 'POST',
        data:{q:query,c:{n:1,skip:0}},
        success: (res, textStatus,xhr) => {
            console.log(textStatus);
            console.log(xhr.status);
            console.log(res);
            result.$data.result = "Success to add " + $('#name').val();
        },
        error: (xhr, textStatus, err) => {
            console.log(textStatus);
            console.log(xhr.status);
            console.log(err);
            result.$data.result = "Fail to add " + $('#name').val();
        }
    });
}