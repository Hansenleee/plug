import { Service } from 'typedi';
import { JsonController, Get, Post, Body } from 'routing-controllers';
import { BaseController } from '../base';
import systemProxy from '../../shared/system-proxy';
import { Configuration } from '../../configuration';

@Service()
@JsonController('/system')
export class SystemProxyController extends BaseController {
  @Get('/proxy/status')
  async getGlobalProxyStatus() {
    const statusStdout = await systemProxy.getStatus();
    const enabled = statusStdout.match(/Enabled: (\w+)/)[1];
    const port = statusStdout.match(/Port: (\d+)/)[1];

    return this.success({
      enabled: enabled === 'Yes' && port === `${Configuration.PROXY_PORT}`,
    });
  }

  @Post('/proxy/toggle')
  async toggleGlobalProxy(@Body() config: { enabled: boolean }) {
    const { enabled } = config;

    if (enabled) {
      await systemProxy.setProxy('127.0.0.1', `${Configuration.PROXY_PORT}`);
    } else {
      await systemProxy.closeProxy();
    }

    return this.success(true);
  }
}
