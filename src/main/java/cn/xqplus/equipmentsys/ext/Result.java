package cn.xqplus.equipmentsys.ext;


/**
 * 返回数据封装类
 */
@Deprecated
public class Result {

    /**
     * String数据返回封装方法
     * @param flag boolean
     * @return String
     */
    public static String stringResult(boolean flag) {
        if (flag) {
            return "success";
        } else {
            return "error";
        }
    }
}
