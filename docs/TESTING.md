# API testing with Postman

1. Import `docs/Saarthi.postman_collection.json` (Import → select the file).
2. Collection variables: `baseUrl` (`http://localhost:3000/api` or the Render URL + `/api`) and `adminPassword`.
3. Run requests in order:

| # | Request | Expected |
|---|---|---|
| 1 | Health check | 200, `ok: true` |
| 2 | Login – supreme admin | 200; the token is saved automatically by the test script |
| 3 | Login – wrong password | 401 |
| 4 | Register – weak password | 400, field `password` |
| 5 | Register citizen | 201; a verification e-mail is sent |
| 6 | Get everything I may see | 200 with data |
| 7 | Write a collection (admin) | 200 `{ok:true, rev}` |
| 8 | Next application number | 200 `{n}` and increases each call |
| 9 | Track grievance | 200, or 403 if the phone does not match |
| 10 | Run escalation check now (admin) | 200 `{changed, escalated}` |

4. Negative tests worth showing: no token on `/db/:key` → 401; citizen token on `/admin/run-escalations` → 403; five wrong passwords → 429 (account locked 10 minutes).
