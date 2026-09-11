// Editorial categories are deliberately broader than definitions: a nudge, not the answer.
const groups = {
  'Programming languages':
    'bash java lisp perl ruby rust sass swift golang kotlin matlab python',
  'Operating systems': 'unix linux netbsd ubuntu',
  'Networking & web protocols':
    'cifs dhcp host http ping port rest sock soap smtp wifi https modem nginx oauth proxy route router socket webdav domain packet',
  'Security & identity':
    'csrf hash hmac saml uuid bcrypt cipher secret vault virus access verify',
  'Hardware & processors': 'bios chip cuda mips nvme pcie cores intel mouse',
  'Storage & files':
    'cache disk disks drive raid backup blob bytes byte gzip zlib load flash',
  'Data formats & encoding':
    'ansi html jpeg json yaml ascii codec latex plist decode encode format',
  'Databases & queries': 'mvcc mysql redis query sqlite schema',
  'Data structures & types':
    'array graph heap queue stack tuple union float null void binary bitmap buffer object scalar string struct tensor vector value',
  'Programming concepts':
    'code data fork init link loop mask mode noop sync task temp user alias async await batch class embed event field fiber flags index input label layer logic model param range scope slice state thunk token handle lambda module opcode public syntax',
  'Developer tools & packages':
    'jest kube lint nano repo spec test yarn babel build clang coder crate debug devop errno error infra ioctl keymap linter eslint gradle malloc printf xcode',
  'Shells & command-line tools':
    'echo grep less post push scan shell touch xterm zshrc chroot prompt',
  'Version control & collaboration':
    'clone merge patch branch commit github gitlab rebase',
  'Web & application frameworks': 'flask react redux unity django svelte',
  'Cloud & deployment':
    'cloud scale apache bundle client deploy docker engine export import plugin server system update worker',
  'Graphics & interfaces':
    'alert font frame media pixel canvas chrome editor iframe layout render shader webgpu webdev',
  'Software development methods': 'agile scrum',
  'Parsing & text processing': 'parse regex parser script xpath',
  'Analytics & data processing': 'kafka numpy radix spark celery hadoop',
  'Operating-system internals':
    'boot swap daemon driver kernel memory thread cron root posix',
  'Web requests & browser data': 'ajax fetch cookie',
  'Administration & technology companies': 'admin apple',
  'Debugging & validation': 'trace assert',
  'Portable code & runtimes': 'wasm node',
};

export const wordCategories = Object.fromEntries(
  Object.entries(groups).flatMap(([category, words]) =>
    words.split(' ').map((word) => [word, category])
  )
);
