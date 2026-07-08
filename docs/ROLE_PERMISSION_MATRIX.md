# Role Permission Matrix

Legend:

- `Create`: endpoint creates or imports data.
- `Read`: endpoint reads, lists, exports, validates, or reports data.
- `Update`: endpoint updates data.
- `Delete`: endpoint soft deletes data.
- Blank means not allowed.

| Endpoint | ADMIN | EE | AE | JE |
|---|---|---|---|---|
| `POST /api/v1/auth/login` | Read | Read | Read | Read |
| `GET /api/v1/auth/profile` | Read | Read | Read | Read |
| `POST /api/v1/users` | Create | Create | Create |  |
| `PATCH /api/v1/users/me/profile` | Update | Update | Update | Update |
| `POST /api/v1/discoms` | Create |  |  |  |
| `GET /api/v1/discoms` | Read |  |  |  |
| `GET /api/v1/discoms/:id` | Read |  |  |  |
| `PATCH /api/v1/discoms/:id` | Update |  |  |  |
| `DELETE /api/v1/discoms/:id` | Delete |  |  |  |
| `POST /api/v1/zones` | Create |  |  |  |
| `GET /api/v1/zones` | Read |  |  |  |
| `GET /api/v1/zones/:id` | Read |  |  |  |
| `PATCH /api/v1/zones/:id` | Update |  |  |  |
| `DELETE /api/v1/zones/:id` | Delete |  |  |  |
| `POST /api/v1/verticals` | Create |  |  |  |
| `GET /api/v1/verticals` | Read |  |  |  |
| `GET /api/v1/verticals/:id` | Read |  |  |  |
| `PATCH /api/v1/verticals/:id` | Update |  |  |  |
| `DELETE /api/v1/verticals/:id` | Delete |  |  |  |
| `POST /api/v1/sub-verticals` | Create |  |  |  |
| `GET /api/v1/sub-verticals` | Read |  |  |  |
| `GET /api/v1/sub-verticals/:id` | Read |  |  |  |
| `PATCH /api/v1/sub-verticals/:id` | Update |  |  |  |
| `DELETE /api/v1/sub-verticals/:id` | Delete |  |  |  |
| `POST /api/v1/substations` | Create | Create | Create |  |
| `GET /api/v1/substations` | Read | Read | Read | Read |
| `GET /api/v1/substations/:id` | Read | Read | Read | Read |
| `PATCH /api/v1/substations/:id` | Update | Update | Update |  |
| `DELETE /api/v1/substations/:id` | Delete |  |  |  |
| `POST /api/v1/incoming-sources` | Create | Create | Create |  |
| `GET /api/v1/incoming-sources` | Read | Read | Read | Read |
| `GET /api/v1/incoming-sources/:id` | Read | Read | Read | Read |
| `PATCH /api/v1/incoming-sources/:id` | Update | Update | Update |  |
| `DELETE /api/v1/incoming-sources/:id` | Delete | Delete | Delete |  |
| `POST /api/v1/outgoing-feeders` | Create | Create | Create |  |
| `GET /api/v1/outgoing-feeders` | Read | Read | Read | Read |
| `GET /api/v1/outgoing-feeders/:id` | Read | Read | Read | Read |
| `PATCH /api/v1/outgoing-feeders/:id` | Update | Update | Update |  |
| `DELETE /api/v1/outgoing-feeders/:id` | Delete | Delete | Delete |  |
| `POST /api/v1/transformers` | Create | Create | Create |  |
| `GET /api/v1/transformers` | Read | Read | Read | Read |
| `GET /api/v1/transformers/:id` | Read | Read | Read | Read |
| `PATCH /api/v1/transformers/:id` | Update | Update | Update |  |
| `DELETE /api/v1/transformers/:id` | Delete | Delete | Delete |  |
| `POST /api/v1/lightning-arresters` | Create | Create | Create |  |
| `GET /api/v1/lightning-arresters` | Read | Read | Read | Read |
| `GET /api/v1/lightning-arresters/:id` | Read | Read | Read | Read |
| `PATCH /api/v1/lightning-arresters/:id` | Update | Update | Update |  |
| `DELETE /api/v1/lightning-arresters/:id` | Delete | Delete | Delete |  |
| `POST /api/v1/battery-banks` | Create | Create | Create |  |
| `GET /api/v1/battery-banks` | Read | Read | Read | Read |
| `GET /api/v1/battery-banks/:id` | Read | Read | Read | Read |
| `PATCH /api/v1/battery-banks/:id` | Update | Update | Update |  |
| `DELETE /api/v1/battery-banks/:id` | Delete | Delete | Delete |  |
| `POST /api/v1/capacitor-banks` | Create | Create | Create |  |
| `GET /api/v1/capacitor-banks` | Read | Read | Read | Read |
| `GET /api/v1/capacitor-banks/:id` | Read | Read | Read | Read |
| `PATCH /api/v1/capacitor-banks/:id` | Update | Update | Update |  |
| `DELETE /api/v1/capacitor-banks/:id` | Delete | Delete | Delete |  |
| `POST /api/v1/imports/validate` | Read | Read | Read |  |
| `POST /api/v1/imports` | Create | Create | Create |  |
| `GET /api/v1/dashboard/summary` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/equipment-summary` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/hierarchy-summary` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/equipment-distribution` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/substation-status` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/transformer-capacity` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/feeder-load` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/import-history` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/recent-import-errors` | Read | Read | Read | Read |
| `GET /api/v1/dashboard/map` | Read | Read | Read | Read |
| `GET /api/v1/reports/substations` | Read | Read | Read | Read |
| `GET /api/v1/reports/transformers` | Read | Read | Read | Read |
| `GET /api/v1/reports/feeders` | Read | Read | Read | Read |
| `GET /api/v1/reports/equipment-summary` | Read | Read | Read | Read |
| `GET /api/v1/reports/substations/pdf` | Read | Read | Read | Read |
| `GET /api/v1/reports/transformers/pdf` | Read | Read | Read | Read |
| `GET /api/v1/reports/feeders/pdf` | Read | Read | Read | Read |
| `GET /api/v1/reports/equipment-summary/pdf` | Read | Read | Read | Read |
| `GET /api/v1/reports/import-history` | Read | Read | Read | Read |
| `GET /api/v1/reports/import-errors` | Read | Read | Read | Read |
| `GET /api/v1/reports/audit-log` | Read | Read | Read | Read |
| `GET /api/v1/health` | Read | Read | Read | Read |
