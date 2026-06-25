import json


def _create_branch(client, auth_headers):
    response = client.post(
        "/branches", json={"name": "Downtown", "location": "Main St"}, headers=auth_headers
    )
    return response.json()["id"]


def test_upload_csv_success(client, auth_headers):
    branch_id = _create_branch(client, auth_headers)
    csv_content = (
        "Date,Item,Qty,Total\n"
        "2026-01-01 12:00,Burger,2,19.98\n"
        "2026-01-01 12:05,Fries,1,3.99\n"
    )
    mapping = {
        "date_column": "Date",
        "item_column": "Item",
        "quantity_column": "Qty",
        "amount_column": "Total",
    }
    response = client.post(
        f"/branches/{branch_id}/uploads",
        files={"file": ("sales.csv", csv_content, "text/csv")},
        data={"mapping": json.dumps(mapping)},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["rows_imported"] == 2
    assert body["rows_rejected"] == 0


def test_upload_csv_missing_columns_returns_422(client, auth_headers):
    branch_id = _create_branch(client, auth_headers)
    mapping = {
        "date_column": "Date",
        "item_column": "Item",
        "quantity_column": "Qty",
        "amount_column": "Total",
    }
    response = client.post(
        f"/branches/{branch_id}/uploads",
        files={"file": ("sales.csv", "Date,Item,Qty\n2026-01-01,Burger,2\n", "text/csv")},
        data={"mapping": json.dumps(mapping)},
        headers=auth_headers,
    )
    assert response.status_code == 422
