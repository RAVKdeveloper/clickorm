#!/usr/bin/env node
import 'reflect-metadata'
import yargs from 'yargs'

import { MigrationGenerateCmd } from './cmds/migrations/migration-gen.cmd'
import { MigrationRunCmd } from './cmds/migrations/migration-up.cmd'
import { InitCmd } from './cmds/init/init.cmd'

yargs
  .usage('Usage: $0 <command> [options]')
  .command(new MigrationGenerateCmd())
  .command(new MigrationRunCmd())
  .command(new InitCmd())
  .recommendCommands()
  .demandCommand(1)
  .strict()
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv
