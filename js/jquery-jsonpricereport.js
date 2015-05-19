$(function () {
    $('ul#collapsePrice > li').jsonpricereport();
});

(function ($) {
    $.fn.jsonpricereport = function () {

        $(this).each(function () {
            var self = $(this);
            var commodity = self.attr('datatype');
            var fileName = 'price_' + commodity + '.json?' + (new Date()).getTime();
            var url = './market/' + fileName;
            $.getJSON(url, function (json) {
                var items = [];
                //約定値段
                var prices = new Array(json.colsize);
                $.each(json.prices, function (i, sessions) {
                    $.each(sessions.values, function (j, value) {
                        if (value == '') return;
                        prices[j] = value;
                    });
                });
                $('#timestamp').append(commodity == '55' ? json.timestamp : '');
                for (var i = 0; i < json.colsize; i++) {
                    // 約定値段
                    var price = prices[i] == undefined ? json.prevprices[i] :  prices[i];
                    // 前日比
                    var duration;
                    if (json.durations[i] == '') {
                            duration = '';
                        if(json.prevprices[i] == '') {
                            duration = ' (新甫)';
                        }
                    } else {
                        duration = ' (' + json.durations[i] + ')';
                    }
                    // 限月一覧 (限月、約定値段(前日比)、出来高)
                    items.push('<li class="list-group-item">');
                    items.push('<a data-toggle="collapse" href="#collapse' + commodity + i + '">');
                    items.push('<div class="row">');
                    items.push('<div class="col-xs-3 col-sm-2 col-md-2">' + json.months[i] + '</div>');
                    items.push('<div class="col-xs-4 col-sm-3 col-md-3">' + price + duration + '</div>');
                    items.push('<div class="col-xs-4 col-sm-3 col-md-3">' + json.volumes[i] + '</div>');
                    items.push('<span class="glyphicon glyphicon-menu-hamburger text-muted"></span>');
                    items.push('</div>');
                    items.push('</a>');

                    // 詳細テーブル
                    items.push('<div id="collapse' + commodity + i + '" class="collapse panel-body">');
                    items.push('<table class="table">');
                    items.push('<tbody>');

                    // 3. 約定値段
                    $.each(json.prices, function (j, sessions) {
                        items.push('<tr>');
                        if (json.amsize >= 0) {
                            if (0 == j) {
                                items.push('<th rowspan=' + json.amsize + '>前場</th>');
                            }
                        }
                        if (json.pmsize >= 0) {
                            if (json.amsize == j) {
                                items.push('<th rowspan=' + json.pmsize + '>後場</th>');
                            }
                        }
                        items.push('<th>' + sessionName(sessions.sid) + '</th>');
                        items.push('<td >' + sessions.values[i] + '</td>');
                        items.push('</tr>');
                    });
                    items.push('</tbody>');
                    items.push('</table>');
                    items.push('</div>');
                    items.push('</div>');
                }

                // 内容の入れ替え.
                $('ul', self).remove();

                $('<ul/>', {
                    class: 'list-group',
                    html: items.join('')
                }).appendTo(self);
            })
                .error(function () {
                    self.contents().remove();
                    self.append('<div class="text-danger">データ読込みに失敗しました</div>');
                });
        });
    }
})(jQuery);

function sessionName(sessionid) {
    if (sessionid == "11") {
        return "第１節";
    }
    if (sessionid == "12") {
        return "第２節";
    }
    if (sessionid == "13") {
        return "第３節";
    }
    if (sessionid == "21") {
        return "第１節";
    }
    if (sessionid == "22") {
        return "第２節";
    }
    if (sessionid == "23") {
        return "第３節";
    }
    return sessionid;
}
