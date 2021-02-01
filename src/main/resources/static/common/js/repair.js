/**
 * 维修信息相关
 */

layui.use(['element', 'form', 'table', 'laydate', 'jquery'], function () {
    let element = layui.element, // 导航栏相关
        form = layui.form, // 表单相关
        table = layui.table, // 数据表格相关
        laydate = layui.laydate, // 日期选择框
        $ = layui.jquery; // jquery
    // 表单search监听
    form.on('submit(search)', function (data) {
        // 时间转换 string -> long
        timeConverter(data);
        delete data.field.createTime; // 传入后台可能出现类型不匹配问题，删除
        // search 后端数据渲染
        tableRender(data.field);
        toolProcess();
    });
    // 日期选择组件渲染
    laydate.render({
        elem: '#createTime',
        range: true,
        // eventElem: '#dateIcon',
        trigger: 'click'
    })
    tableRender({});
    toolProcess();

    /**
     * 数据表格渲染
     * @param where 查询传参
     */
    function tableRender(where) {
        // 后端数据渲染
        table.render({
            elem: '#repairData'
            ,url:'/equipmentSys/repair/page'
            ,method: 'GET'
            ,async: false
            ,where: where // 携带参数
            ,height: 370
            ,parseData: function(res){ //res 即为原始返回的数据
                return {
                    "code": res.maxLimit, //解析接口状态
                    "msg": res.countId, //解析提示文本
                    "count": res.total, //解析数据长度
                    "data": res.records, //解析数据列表
                };
            }
            ,toolbar: '#topToolBar' //开启头部工具栏，并为其绑定左侧模板
            ,defaultToolbar: ['filter', 'exports', 'print', { //自定义头部工具栏右侧图标。如无需自定义，去除该参数即可
                title: '提示'
                ,layEvent: 'LAYTABLE_TIPS'
                ,icon: 'layui-icon-tips'
            }]
            ,title: '维修信息表'
            ,page: true // 开启分页
            ,limit: 10
            ,cellMinWidth: 80 // 全局常规单元格最小宽度
            ,cols: [
                [{type: 'checkbox', fixed: 'left'}
                ,{type: 'numbers', title: '序号', fixed: 'left', sort: true, width: 80}
                ,{field: 'id', title: 'ID', sort: true, fixed: 'left', width: 80, hide: true} // 隐藏数据表id
                ,{field: 'repairNumber', title: '维修编号', sort: true}
                ,{field: 'equipName', title: '设备名称'}
                ,{field: 'equipTypeName', title: '设备类型名称'}
                ,{field: 'reporterName', title: '报修人'}
                ,{field: 'reportDate', title: '报修时间', sort: true}
                ,{field: 'currentState', title: '当前状态'}
                ,{fixed: 'right', title:'操作', toolbar: '#rightToolBar', width: 150}]
            ]
        });
    }

    /**
     * 头工具栏和行工具栏事件
     */
    function toolProcess() {
        // 头工具栏事件(新增)
        table.on('toolbar(repairData)', function(obj){
            let checkStatus = table.checkStatus(obj.config.id); // 选中行信息
            switch(obj.event){
                case 'add':
                    addFormDialog(layer, form, $,
                        '新增设备信息', equipContent,
                        null,
                        null,
                        null,
                        null,
                        '/equipmentSys/equipment/add',
                        'addEquip');
                    break;
                case 'getCheckLength':
                    let data = checkStatus.data;
                    layer.msg('选中了：'+ data.length + ' 个');
                    break;
                case 'isAll':
                    layer.msg(checkStatus.isAll ? '全选': '未全选');
                    break;
                //自定义头工具栏右侧图标 - 提示
                case 'LAYTABLE_TIPS':
                    layer.alert('这是工具栏右侧自定义的一个图标按钮');
                    break;
            }
        });
        // 监听行工具事件(维修，报废)
        table.on('tool(repairData)', function(obj){
            let data = obj.data; // 操作行数据
            if (obj.event === 'repair') {
                layer.confirm('当前设备：'+data.equipTypeName+data.equipName+'，维修编号：'+data.repairNumber+'，确认维修完成？', {icon: 3, title: '提示'}, function (index) {
                    $.ajax({
                        async: false,
                        type: 'GET',
                        url: '/equipmentSys/repair/repair', // 维修接口
                        data: {id: data.id},
                        success: function (data) {
                            layer.close(index);
                            if (data === 'success') {
                                layer.msg('维修成功', {icon: 1});
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            }
                            if (data === 'error') {
                                layer.msg('维修失败，请重试或联系管理员！', {icon: 2});
                            }
                        }
                    });
                });
            } else if (obj.event === 'scrap') {
                layer.confirm('当前设备：'+data.equipTypeName+data.equipName+'，维修编号：'+data.repairNumber+'，确认报废？', {icon: 3, title: '警告'}, function (index) {
                    $.ajax({
                        async: false,
                        type: 'GET',
                        url: '/equipmentSys/repair/scrap', // 报废接口
                        data: {id: data.id},
                        success: function (data) {
                            layer.close(index);
                            if (data === 'success') {
                                layer.msg('报废成功', {icon: 1});
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            }
                            if (data === 'noProcess') {
                                layer.msg('抱歉，当前设备状态不能报废', {icon: 2});
                            }
                            if (data === 'error') {
                                layer.msg('报修失败，请重试或联系管理员！', {icon: 2});
                            }
                        }
                    });
                });
            }
        });
    }

});