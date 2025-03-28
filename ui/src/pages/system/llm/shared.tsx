import { Typography } from 'antd';

export enum LLMProviderEnum {
  volcengine = 'volcengine',
  baidu = 'baidu',
  local = 'local'
}

export const LLM_APPLY_MAP = {
  [LLMProviderEnum.volcengine]: (
    <Typography.Link
      href="https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey"
      target="_blank"
    >
      火山引擎申请 API 地址
    </Typography.Link>
  ),
  [LLMProviderEnum.baidu]: (
    <Typography.Link
      href="https://console.bce.baidu.com/iam/#/iam/apikey/list"
      target="_blank"
    >
      百度千帆申请 API 地址
    </Typography.Link>
  ),
  [LLMProviderEnum.local]: null
}
