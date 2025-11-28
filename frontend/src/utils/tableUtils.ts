import { QTableColumn } from "quasar";

export const tableUtils = {
  newTableColumn,
};

function newTableColumn(options: QTableColumn): QTableColumn {
  return {
    name: options.name,
    label: options.label,
    field: options.field,
    align: options.align || "left",
    sortable: options.sortable || false,
    style:
      options.style ||
      "max-width: 200px; padding-right: 10px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",
    format: options.format,
  };
}
