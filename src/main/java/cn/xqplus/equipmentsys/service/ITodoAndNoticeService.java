package cn.xqplus.equipmentsys.service;

import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * 待办、通知、公告信息服务层
 */

public interface ITodoAndNoticeService extends IService<Object> {

    /**
     * 获取待办信息数据
     * @return List<Object>
     */
    List<Object> getTodoInfo();
}
