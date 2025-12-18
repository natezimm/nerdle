export const fourLetterTechWords = [
    "bash", "bios", "boot", "byte", "chip", "code", "cron", "cuda", "data", "disk",
    "echo", "fork", "grep", "hash", "heap", "html", "http", "java", "json", "kube",
    "lisp", "link", "lint", "load", "loop", "mask", "mode", "nano", "node", "noop",
    "null", "ping", "port", "raid", "repo", "rest", "root", "ruby", "rust", "sass",
    "scan", "sock", "spec", "swap", "sync", "task", "temp", "test", "unix", "user",
    "uuid", "void", "wifi", "yaml", "yarn",
];

export const fiveLetterTechWords = [
    "admin", "alert", "apple", "array", "ascii", "async", "await", "batch", "build", "bytes",
    "cache", "class", "clone", "cloud", "coder", "cores", "debug", "devop", "disks", "drive",
    "embed", "error", "event", "field", "fetch", "flash", "float", "frame", "flags", "graph",
    "https", "index", "infra", "input", "intel", "label", "layer", "linux", "logic", "media",
    "merge", "model", "modem", "mouse", "param", "parse", "patch", "pixel", "proxy", "query",
    "queue", "range", "react", "redis", "redux", "regex", "route", "scale", "scope", "shell",
    "slice", "state", "stack", "token", "touch", "tuple", "union", "unity", "value", "virus",
];

export const sixLetterTechWords = [
    "access", "apache", "assert", "binary", "branch", "buffer", "cipher", "client", "commit",
    "cookie", "daemon", "decode", "deploy", "driver", "docker", "domain", "editor", "encode",
    "engine", "export", "format", "github", "golang", "handle", "import", "kernel", "kotlin",
    "lambda", "layout", "memory", "module", "object", "plugin", "prompt", "public", "rebase",
    "render", "router", "schema", "script", "secret", "server", "socket", "sqlite", "string",
    "struct", "syntax", "system", "thread", "ubuntu", "update", "vector", "verify",
];

export const techWordsByLength = {
    4: fourLetterTechWords,
    5: fiveLetterTechWords,
    6: sixLetterTechWords,
};

export default fiveLetterTechWords;
