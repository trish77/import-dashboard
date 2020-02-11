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
            $(this).find('i').toggleClass('fa-caret-down fa-caret-up');
           $(thisRow).find('.actions-dropdown i').toggleClass('fa-caret-down fa-caret-up');

            thisRow.children("td:nth-of-type(2) ~ td").not('.actions').removeClass('hidden-xs hidden-sm');


        } else {
            $(this).find("a").html("View More Info");
            thisRow.children("td:nth-of-type(2) ~ td").css('display','none');
            $(this).find('i').toggleClass('fa-caret-down fa-caret-up');
            $(thisRow).find('.actions-dropdown i').toggleClass('fa-caret-down fa-caret-up');


        }

        //decalre width of window for mobile browser comparison
        var width = $(window).width();

        $( window ).resize(function() {

            //only reset datatable expanded rows if width was resized because mobile
            //browsers trigger resize when scrolling (url bar appears)
            if($(window).width() != width){
                thisRow.children("td:nth-of-type(3) ~ td").css('display','table-cell');
                thisRow.children("td:nth-of-type(2) ~ td").addClass('hidden-xs hidden-sm');
                $(thisRow).find('.expand-mobile-row i').addClass('fa-caret-down');
                $(thisRow).find('.expand-mobile-row i').removeClass('fa-caret-up');
                $(thisRow).find('.actions-dropdown i').addClass('fa-caret-down');
                $(thisRow).find('.actions-dropdown i').removeClass('fa-caret-up');
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


