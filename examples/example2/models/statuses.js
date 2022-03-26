module.exports = {
  id: {
    type: 'integer',
    constraints: ['primary'],
    hash: 'WzE2NDM2Mzc1NDY0Mjddc3RhdHVzZXMuaWQ',
  },
  state: {
    type: 'enum',
    defaultTo: 'active',
    constraints: ['notNullable'],
    dataset: ['active', 'inactive'],
    hash: 'WzE2NDM2Mzc1NDY0Mjddc3RhdHVzZXMuc3RhdGU',
  },
  lastSeen: {
    type: 'datetime',
    useTz: true,
    hash: 'WzE2NDM2Mzc1NDY0Mjddc3RhdHVzZXMubGFzdFNlZW4',
  },
  updated_at: {
    type: 'timestamp',
    hash: 'WzE2NDM2Mzc1NDY0Mjddc3RhdHVzZXMudXBkYXRlZF9hdA',
  },
  created_at: {
    type: 'timestamp',
    hash: 'WzE2NDM2Mzc1NDY0Mjddc3RhdHVzZXMuY3JlYXRlZF9hdA',
  },
  hash: 'WzE2NDM2Mzc1NDY0MjZdc3RhdHVzZXM',
};
