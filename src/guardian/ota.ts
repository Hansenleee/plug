import { Service } from 'typedi';
import { execSync, spawnSync } from 'child_process';
import ora from 'ora';
import inquirer from 'inquirer';
import { pkgJson } from '../shared/pkg';
import { Logger } from '../shared/log';
import { Configuration } from '../configuration';

const logger = new Logger('OTA');

@Service()
export class OTA {
  private spinner = ora();

  async checkAndUpgrade() {
    this.spinner.start('检查更新中...');

    try {
      const latestVersion = await this.getLatestOfficialVersion();
      const { needUpgrade, auto } = await this.checkIfNeedUpgrade(latestVersion);

      if (!needUpgrade) {
        this.spinner.stop();
        return;
      }

      const callUpgrade = () => {
        this.spinner.start('自动更新中...');
        this.upgrade();
        this.spinner.succeed('更新成功，正在重新启动程序');
        this.restart();
      };

      if (auto) {
        return callUpgrade();
      }

      const toUpgrade = await this.askToUpgrade(latestVersion);

      if (toUpgrade) {
        return callUpgrade();
      }
    } catch (err) {
      logger.warn(`更新失败: ${err.message}`);
      this.spinner.fail('检查更新失败, 已自动跳过');
    }
  }

  private async getLatestOfficialVersion() {
    const versions = execSync(
      `npm view ${pkgJson.name} versions --registry=${Configuration.NPM_REGISTRY}`
    )
      .toString()
      .split('\n')
      .filter((v) => !v.includes('beta') || !v.includes('alpha'));

    return versions[versions.length - 1];
  }

  private async checkIfNeedUpgrade(latestVersion: string) {
    const currentVersion = pkgJson.version;
    const currentVersionList = this.getVersionList(currentVersion);
    const latestVersionList = this.getVersionList(latestVersion);

    if (latestVersionList[0] > currentVersionList[0]) {
      // 大版本更新
      return {
        needUpgrade: true,
        auto: false,
      };
    }

    if (
      latestVersionList[1] > currentVersionList[1] ||
      latestVersionList[2] > currentVersionList[2]
    ) {
      return {
        needUpgrade: true,
        auto: true,
      };
    }

    return {
      needUpgrade: false,
      auto: false,
    };
  }

  private getVersionList(version: string) {
    try {
      return version
        .split('-')[0]
        .split('.')
        .map((v) => +v);
    } catch (err) {
      logger.warn(`版本号 ${version} 不符合规范，解析错误: ${err.message}`);

      return [];
    }
  }

  private askToUpgrade(latestVersion: string) {
    return inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'upgrade',
          message: `发现新版本 ${latestVersion}，是否更新？`,
          default: true,
        },
      ] as any)
      .then(({ upgrade }) => upgrade)
      .catch(() => false);
  }

  private upgrade() {
    const result = execSync(
      `npm install ${pkgJson.name}@latest -g --registry=${Configuration.NPM_REGISTRY}`,
      { encoding: 'utf8' }
    ).toString();

    return result;
  }

  private restart() {
    const [command, ...args] = process.argv;

    return spawnSync(command, args, {
      stdio: [process.stdin, process.stdout, process.stderr],
    });
  }
}
