function generateDynamicDataTitles() {
    //dynamical add data-titles to each cell
    $(".no-more-tables").each(function() {
        var nmtTable = $(this);
        var nmtHeadRow = nmtTable.find("thead tr");
        nmtTable.find("tbody tr").each(function() {
            var curRow = $(this);
            for (var i = 1; i < curRow.find("td").length; i++) {
                var rowSelector = "td:eq(" + i + ")";
                var headSelector = "th:eq(" + i + ")";
                curRow.find(rowSelector).attr('data-title', nmtHeadRow.find(headSelector).html());
            }
        });

    });
}

function expandMobileRow(){
    //show rest of cells on click in mobile
    $(".expand-mobile-row").click(function(e) {

        var thisRow = $(this).parents("tr");

        if (thisRow.children("td:visible").length < 3) {

            $(this).find("a").html("Hide More Info");
            thisRow.children("td:nth-of-type(2) ~ td").css('display','block');
            $(this).find('i').toggleClass('icon-caret-down icon-caret-up');
           $(thisRow).find('.actions-dropdown i').toggleClass('icon-caret-down icon-caret-up');

            thisRow.children("td:nth-of-type(2) ~ td").not('.actions').removeClass('hidden-xs hidden-sm');


        } else {
            $(this).find("a").html("View More Info");
            thisRow.children("td:nth-of-type(2) ~ td").css('display','none');
            $(this).find('i').toggleClass('icon-caret-down icon-caret-up');
            $(thisRow).find('.actions-dropdown i').toggleClass('icon-caret-down icon-caret-up');


        }

        //decalre width of window for mobile browser comparison
        var width = $(window).width();

        $( window ).resize(function() {

            //only reset datatable expanded rows if width was resized because mobile
            //browsers trigger resize when scrolling (url bar appears)
            if($(window).width() != width){
                thisRow.children("td:nth-of-type(3) ~ td").css('display','table-cell');
                thisRow.children("td:nth-of-type(2) ~ td").addClass('hidden-xs hidden-sm');
                $(thisRow).find('.expand-mobile-row i').addClass('icon-caret-down');
                $(thisRow).find('.expand-mobile-row i').removeClass('icon-caret-up');
                $(thisRow).find('.actions-dropdown i').addClass('icon-caret-down');
                $(thisRow).find('.actions-dropdown i').removeClass('icon-caret-up');
                $(".expand-mobile-row").find("a").html("View More Info");
        }
        });
    });
}

function updateSelected(tableName) {
    if ($(".seat-availability-message").length){
    var $alert = $('.alert');
    var text = $alert.attr('data-template');
    var max = $alert.attr('data-max');
    var selected = tableName.rows('.selected').data().length;
    $alert.html(text.replace("{selected}", selected).replace('{max}',max));

    if (selected > max){
        $alert.addClass('alert-danger');
    }
    else{
        $alert.removeClass('alert-danger');
    }

    if(max === "0"){
        var resultsTableRows = $("#resultsTable tr");
        resultsTableRows.addClass("disabled");
    }
    }
}

function customizeColumns(tableName) {
     //hide and show table columns
    $('input.toggle-vis').on('change', function(e) {
        // Get the column API object
        var column = tableName.column($(this).attr('data-column'));

        // Toggle the visibility
        column.visible(!column.visible());

        //repopulate data titles for all columns
        generateDynamicDataTitles();
    });
}

function selectRowsOnClick(tableName) {
    tableName.on('click', 'tbody tr:not(.uncheckable-dt-row, .disabled) td:not(.actions)', function(e) {

        if (!$(e.target).hasClass('no-select'))  {

                var $tr = $(this).closest('tr');
                var $checkbox = $tr.find('.checkbox');

                $tr.toggleClass('selected');

                $checkbox.prop("checked", !$checkbox.prop("checked"));

                if ($checkbox.prop("checked") === false) {
                    $("#selectAllRows").parents("th").removeClass("checkable-dt-checked");
                    $("#selectAllRows").prop("checked", false);
                }

        }
                updateSelected(tableName);
});
}

function selectRowOnCheckboxChange(tableName){
    $(".checkbox").change(function() {

        var $checkbox = $(this);

        if ($checkbox.prop('checked')) {
            $checkbox.parents("tr").addClass("selected");
        } else {
            $checkbox.parents("tr").removeClass("selected");
            $("#selectAllRows").parents("th").removeClass("checkable-dt-checked");
            $("#selectAllRows").prop("checked", false);
        }

        updateSelected(tableName);
    });
}

function selectAll(tableName){
    $(".checkbox").prop("checked", true);
    $(".checkable-dt-check-all").addClass('checkable-dt-checked');
    tableName.rows(':not(.uncheckable-dt-row)').select();
}

function deselectAll(tableName) {
    $(".checkbox").prop("checked", false);
    $(".checkable-dt-check-all").removeClass('checkable-dt-checked');
    tableName.rows().deselect();
}

function keepDropDownMenuOpen() {
    //keep column menu open until user clicks off
    $('body').click(function(event) {
        var target = $(event.target),
            targetInMenu = ($(target).parents('.checkbox-dropdown').length > 0);

        if (targetInMenu === true) {
            $('.dropdown.keep-open').on('hide.bs.dropdown', function() {
                return false;
            });

        } else {
            $('.dropdown.keep-open').removeClass("open");
        }
    });
}


/* Formatting function for row details - modify as you need */
function dataFormat(d) {
    var result = '';
    var hasChildren = false;
    for (i = 0; i < d.length; i++) {

        if (d[i].Col0 == "WORKED") shouldBeOrange = false;

        result +=
          '<table><tr style="background-color: ' + (shouldBeOrange == true ? '#ff9c59' : '') + '">' +
          '<td></td>' +
          '<td style="font-weight: ' + (d[i].Col0 == "WORKED" || d[i].Col0 == "OTHER" ? 'bold' : '') + '">' + d[i].Col0 + '</td>' +
          '<td>' + d[i].Col1 + '</td>' +
          '<td>' + d[i].Col2 + '</td>' +
          '</tr></table>';

        if (d[i].Col0 == "OTHER")
            shouldBeOrange = true;

        hasChildren = true;
    }

    if (!hasChildren)
        result += '<tr><td>There are no items in this view.</td></tr>';

    return $(result);
}

function ProcessTableVehicleDetailV2(id, tableData) {
    if (!$.fn.dataTable.isDataTable('#' + id)) {
        $('#' + id).DataTable({
            data: tableData,
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excelHtml5', 'pdfHtml5', 'print'
            ],
            columns: [{
                "class": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
                {
                    data: "Col0"
                }
            ],
            ordering: false,
            "scrollY": "400px",
            "paging": false,
            "searching": false,
            "info": false,
            'responsive': true,
            "language": {
                "emptyTable": "No Data"
            },
            "createdRow": function(row, data, index) {
                if (data.Col0 === " " && data.Col1 === " " && data.Col2 === " ")
                    $('td', row).eq(0).removeClass('details-control');
            },
            "render": function(data, type, full, meta) {
                return full["Col0"] + "" + full["Col1"] + "" + full["Col2"];
            },
            "initComplete": function() {
                $('.dataTables_scrollBody thead tr').addClass('hidden');
                $('.dataTables_scrollBody thead th').addClass('hidden');
                $('.dataTables_scrollBody tfoot tr').addClass('hidden');
                $(".dataTables_scrollBody th").removeAttr('class');
                $('.dataTables_scrollBody table thead').addClass('hidden');
                $('.dataTables_wrapper table tfoot').addClass('hidden');
            }
        });

        $('#' + id).DataTable().columns.adjust();

        $('#' + id).on('click', 'td.details-control', function() {
            var tr = $(this).parents('tr');
            var table = $('#' + id).DataTable();
            var row = table.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('details');
            } else {

                // Open this row
                row.child(dataFormat(row.data().detail)).show();
                tr.addClass('details');
            }
        });

        //$('#data_table_' + id).DataTable().$('tr', { "filter": "applied" }).addClass('odd');
    }
}
$(document).ready(function() {
    var TableContent = [{
        Col0: "2019-03-09 05:10 AM - 2019-03-09 06:14 AM • - • Bothways: 1 enter • Spend Time: 01:04 [00:00] Active: 00:00 Travel: 01:03 Something Else: 01:00 - 0 OTHER",
        Col1: "",
        Col2: "",
        detail: [{
            Col0: "WORKED",
            Col1: "",
            Col2: ""
        },
            {
                Col0: "05:10 AM",
                Col1: "-",
                Col2: "0 minutes"
            }
        ]
    }];

    setTimeout(function() {
        ProcessTableVehicleDetailV2("example", TableContent);
    }, 100);
});
