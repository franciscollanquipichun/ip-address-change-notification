import arg from 'arg';
import { onChangeIpAddressSendNotification } from './main';

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
        {
            // Types
            '--email': String,

            // Aliases
            '-e': '--email',
        },
        {
            argv: rawArgs.slice(2),
        }
    );

    if (!args['--email']) throw new Error('missing required argument: --email');

    return {
        notificationEmail: args['--email'] || false,
    };
}

export function cli(args) {
    const options = parseArgumentsIntoOptions(args);
    onChangeIpAddressSendNotification(options);
}