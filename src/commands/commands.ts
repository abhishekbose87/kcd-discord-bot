import type * as TDiscord from 'discord.js'
import {getCommandArgs, sendBotMessageReply} from '../utils'
import {meetup} from './command-fns/meetup'
import {blog} from './command-fns/blog'
import {info} from './command-fns/info'
import {kif} from './command-fns/kif'
import {thanks} from './command-fns/thanks'
import {clubs} from './command-fns/clubs'

type CommandFn = {
  (message: TDiscord.Message): Promise<unknown>
  authorize?: (message: TDiscord.Message) => boolean
  help?: (message: TDiscord.Message) => void
  description?: string
}

const commands: Record<string, CommandFn | undefined> = {
  // the help command depends on this, so we do not include it here...
  help,
  kif,
  thanks,
  clubs,
  info,
  blog,
  meetup,
} as const

// the help command depends on all the other commands, so we just inline it here
// Command purpose:
// lists all available commands
async function help(message: TDiscord.Message) {
  const args = getCommandArgs(message.content)
  const [arg1 = ''] = args.split(' ')
  const commandFn = commands[arg1]
  if (commandFn) {
    if (commandFn.authorize && !commandFn.authorize(message)) return

    if (commandFn.help) {
      return commandFn.help(message)
    } else if (commandFn.description) {
      return sendBotMessageReply(message, commandFn.description)
    }
  } else {
    const result = sendBotMessageReply(
      message,
      `
Here are the available commands (for more details on a command, type \`?help <name-of-command>\`):

- ${Object.entries(commands)
        .filter(([, fn]) => fn?.authorize?.(message) ?? true)
        .map(([name, fn]) => [name, fn?.description].filter(Boolean).join(': '))
        .join('\n- ')}
      `.trim(),
    )
    return result
  }
}
help.description = 'Lists available commands'

export default commands
export {help}
