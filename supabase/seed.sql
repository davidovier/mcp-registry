-- Seed data for local development only
-- This file is run by `supabase db reset` and should NOT be applied to production

INSERT INTO public.mcp_servers (slug, name, description, homepage_url, repo_url, docs_url, tags, transport, auth, capabilities, verified) VALUES
(
    'filesystem',
    'Filesystem MCP Server',
    'Provides tools for reading, writing, and managing files on the local filesystem. Supports common operations like list, read, write, delete, and search.',
    'https://modelcontextprotocol.io/servers/filesystem',
    'https://github.com/modelcontextprotocol/servers',
    'https://modelcontextprotocol.io/docs/servers/filesystem',
    ARRAY['files', 'storage', 'local', 'official'],
    'stdio',
    'none',
    '{"tools": true, "resources": true, "prompts": false}',
    true
),
(
    'github',
    'GitHub MCP Server',
    'Integrates with GitHub API to manage repositories, issues, pull requests, and more. Enables AI assistants to interact with GitHub workflows.',
    'https://modelcontextprotocol.io/servers/github',
    'https://github.com/modelcontextprotocol/servers',
    'https://modelcontextprotocol.io/docs/servers/github',
    ARRAY['git', 'vcs', 'github', 'official', 'api'],
    'stdio',
    'oauth',
    '{"tools": true, "resources": true, "prompts": true}',
    true
),
(
    'postgres',
    'PostgreSQL MCP Server',
    'Connect to PostgreSQL databases to query data, inspect schemas, and execute SQL. Includes safety features to prevent destructive operations.',
    'https://modelcontextprotocol.io/servers/postgres',
    'https://github.com/modelcontextprotocol/servers',
    'https://modelcontextprotocol.io/docs/servers/postgres',
    ARRAY['database', 'sql', 'postgres', 'official'],
    'stdio',
    'other',
    '{"tools": true, "resources": true, "prompts": false}',
    true
),
(
    'slack',
    'Slack MCP Server',
    'Enables AI assistants to interact with Slack workspaces. Send messages, read channels, manage threads, and search conversation history.',
    'https://modelcontextprotocol.io/servers/slack',
    'https://github.com/modelcontextprotocol/servers',
    NULL,
    ARRAY['chat', 'messaging', 'slack', 'official'],
    'http',
    'oauth',
    '{"tools": true, "resources": true, "prompts": false}',
    true
),
(
    'web-search',
    'Web Search MCP Server',
    'Provides web search capabilities using various search engines. Returns structured results including titles, snippets, and URLs.',
    NULL,
    'https://github.com/example/web-search-mcp',
    NULL,
    ARRAY['search', 'web', 'community'],
    'both',
    'api_key',
    '{"tools": true, "resources": false, "prompts": false}',
    false
);
