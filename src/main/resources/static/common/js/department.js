/**
 * 部门信息相关
 */

layui.use(['element', 'form', 'table', 'laydate', 'jquery'], function () {
    let element = layui.element, // 导航栏相关
        form = layui.form, // 表单相关
        table = layui.table, // 数据表格相关
        laydate = layui.laydate, // 日期选择框
        $ = layui.jquery; // jquery
    // 表单search监听
    form.on('submit(search)', function (data) {
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
    // 设置待处理事件 徽章
    setBadge();

    /**
     * 数据表格渲染
     * @param where 参数
     */
    function tableRender(where) {
        // 后端数据渲染
        table.render({
            elem: '#deptData'
            ,url:'/equipmentSys/department/page'
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
            ,title: '部门信息表'
            ,page: true // 开启分页
            ,limit: 10
            ,cellMinWidth: 80 // 全局常规单元格最小宽度
            ,cols: [
                [{type: 'checkbox', fixed: 'left'}
                ,{type: 'numbers', title: '序号', fixed: 'left', sort: true, width: 80}
                ,{field: 'id', title: 'ID', sort: true, fixed: 'left', width: 80, hide: true} // 隐藏数据表id
                ,{field: 'deptNumber', title: '部门编号', sort: true}
                ,{field: 'deptName', title: '部门名称'}
                ,{field: 'deptIntroduce', title: '部门简介', width: 250}
                ,{field: 'createDate', title: '创建时间', sort: true}
                ,{field: 'updateDate', title: '修改时间', sort: true}
                ,{fixed: 'right', title:'操作', toolbar: '#rightToolBar', width: 120}]
            ]
        });
    }
    /**
     * 头工具栏和行工具栏事件
     */
    function toolProcess() {
        // 头工具栏事件(新增)
        table.on('toolbar(deptData)', function(obj){
            let checkStatus = table.checkStatus(obj.config.id); // 选中行信息
            switch(obj.event){
                case 'add':
                    addFormDialog(layer, form, $,
                        '新增部门信息', deptContent,
                        null,
                        null,
                        null,
                        'roleType',
                        '/equipmentSys/department/add',
                        'addDept');
                    break;
                case 'getCheckLength':
                    var data = checkStatus.data;
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
        // 监听行工具事件(编辑，删除)
        table.on('tool(deptData)', function(obj){
            let data = obj.data; // 操作行数据
            if (obj.event === 'edit') {
                addFormDialog(layer, form, $,
                    '编辑部门信息', deptContent,
                    null,
                    null,
                    null,
                    'roleType',
                    '/equipmentSys/department/update',
                    'editDept', data);
            } else if (obj.event === 'del') {
                layer.confirm('确定删除部门 '+data.deptName+' 的信息？', function (index) {
                    $.ajax({
                        async: false,
                        type: 'POST',
                        url: '/equipmentSys/department/delete',
                        data: {id: data.id},
                        success: function (data) {
                            layer.close(index);
                            if (data === 'existsUser') {
                                layer.alert('删除失败，该部门下存在用户；如果您仍要删除，请先慎重考虑后删除该部门下用户再执行该操作！', {icon: 5});
                            }
                            if (data === 'success') {
                                layer.msg('删除成功', {icon: 1});
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1500);
                            }
                            if (data === 'error') {
                                layer.msg('删除失败，请重试或联系管理员！', {icon: 2});
                            }
                        }
                    });
                });
            }
        });
    }
});