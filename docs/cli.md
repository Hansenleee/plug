# CLI

## run

`plug run` 通过常驻进程的形式在后台运行，关闭终端后 `plug` 仍会在后台运行。

## start

`plug start` 在前台运行 `plug`，关闭终端后 `plug` 会自动关闭

## status

`plug status` 查看 `plug` 的运行状态

## stop

`plug stop` 停止 `plug` 的运行

## clear

- `plug clear -l` 清理日志缓存
- `plug clear -s` 清理数据缓存（**谨慎操作，会影响 `plug` 运行**）