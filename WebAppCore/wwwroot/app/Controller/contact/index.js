﻿var conactController = function () {
    this.initialize = function () {
        loadData();
        registerEvents();
        registerControls();
    };

    function registerEvents() {
        //todo: binding events to controls
        $('#ddl-show-page').on('change', function () {
            structures.configs.pageSize = $(this).val();
            structures.configs.pageIndex = 1;
            loadData(true);
        });

        $('#btnSearch').on('click', function () {
            loadData();
        });

        $('#txtKeyword').on('keypress', function (e) {
            // 13 là key enter
            if (e.which === 13) {
                loadData();
            }
        });

        $("#btn-create").on('click', function () {
            resetFormMaintainance();
            $('#modal-add-edit').modal('show');
        });

        $('body').on('click', '.btn-edit', function (e) {
            e.preventDefault();
            var that = $(this).data('id');
            loadDetails(that);
        });

        $('#btnSave').on('click', function (e) {
            saveProduct(e);
        });

        $('body').on('click', '.btn-delete', function (e) {
            e.preventDefault();
            var that = $(this).data('id');
            deleteConact(that);
        });

        $('#btnSelectImg').on('click', function () {
            $('#fileInputImage').click();
        });

        $("#fileInputImage").on('change', function () {
            var fileUpload = $(this).get(0);
            var files = fileUpload.files;
            var data = new FormData();
            for (var i = 0; i < files.length; i++) {
                data.append(files[i].name, files[i]);
            }
            $.ajax({
                type: "POST",
                url: "/Admin/Upload/UploadImageSlide",
                contentType: false,
                processData: false,
                data: data,
                success: function (path) {
                    $('#txtImage').val(path);
                    structures.notify('Upload image succesful!', 'success');
                },
                error: function () {
                    structures.notify('There was error uploading files!', 'error');
                }
            });
        });

    }

    function loadDetails(id) {
        $.ajax({
            type: "GET",
            url: "/Admin/Contact/GetById",
            data: { id: id },
            dataType: "json",
            beforeSend: function () {
                structures.startLoading();
            },
            success: function (response) {
                var data = response;
                $('#hidId').val(data.Id);
                $('#txtName').val(data.Name);
                $('#txtPhone').val(data.Phone);
                $('#txtEmail').val(data.Email);
                $('#txtLat').val(data.Lat);
                $('#txtLng').val(data.Lng);
                $('#txtWebsite').val(data.Website);
                $('#txtAddress').val(data.Address);
                $('#ckStatusM').prop('checked', data.Status === 1);


                $('#modal-add-edit').modal('show');
                structures.stopLoading();
            },
            error: function (status) {
                structures.notify('Có lỗi xảy ra', 'error');
                structures.stopLoading();
            }
        });
    }

    function deleteConact(id) {
        structures.confirm('Are you sure to delete?', function () {
            $.ajax({
                type: "POST",
                url: "/Admin/Contact/Delete",
                data: { id: id },
                dataType: "json",
                beforeSend: function () {
                    structures.startLoading();
                },
                success: function (response) {
                    structures.notify('Delete successful', 'success');
                    structures.stopLoading();
                    loadData();
                },
                error: function (status) {
                    structures.notify('Has an error in delete progress', 'error');
                    structures.stopLoading();
                }
            });
        });
    }

    function loadData(isPageChanged) {
        var template = $('#table-template').html();
        var render = "";
        $.ajax({
            type: 'GET',
            data: {
                keyword: $('#txtKeyword').val(),
                page: structures.configs.pageIndex,
                pageSize: structures.configs.pageSize
            },
            url: '/admin/Contact/GetAllPaging',
            dataType: 'JSON',
            success: function (response) {
                $.each(response.Results, function (i, item) {
                    render += Mustache.render(template, {
                        Id: item.Id,
                        Name: item.Name,
                        Phone: item.Phone,
                        Email: item.Email,
                        Lat: item.Lat,
                        Lng: item.Lng
                    });
                });
                $('#lblTotalRecords').text(response.RowCount);
                if (render !== '') {
                    $('#tbl-content').html(render);
                }
                wrapPaging(response.RowCount, function () {
                    loadData();
                }, isPageChanged);
            },
            error: function (status) {
                console.log(status);
                structures.notify('Không thể tải dữ liệu', 'error');
            }
        });
    }

    function saveProduct(e) {
        if ($('#frmMaintainance').valid()) {
            e.preventDefault();
            var id = $('#hidId').val();
            var name = $('#txtName').val();
            var phone = $('#txtPhone').val();
            var email = $('#txtEmail').val();
            var lat = $('#txtLat').val();
            var lng = $('#txtLng').val();
            var website = $('#txtWebsite').val();
            var address = $('#txtAddress').val();
            var status = $('#ckStatus').prop('checked') === true ? 1 : 0;
            $.ajax({
                type: "POST",
                url: "/Admin/Contact/SaveEntity",
                data: {
                    Id: id,
                    Name: name,
                    Phone: phone,
                    Email: email,
                    Lat: lat,
                    Lng: lng,
                    Website: website,
                    Address: address,
                    Status: status
                },
                dataType: "json",
                beforeSend: function () {
                    structures.startLoading();
                },
                success: function (response) {
                    structures.notify('Update product successful', 'success');
                    $('#modal-add-edit').modal('hide');
                    resetFormMaintainance();

                    structures.stopLoading();
                    loadData(true);
                },
                error: function () {
                    structures.notify('Có lổi trong quá trình thêm.', 'error');
                    structures.stopLoading();
                }
            });
            return false;
        }
    }

    function resetFormMaintainance() {
        $('#hidId').val('');
        $('#txtName').val('');
        $('#txtImage').val('');
        $('#txtUrl').val('');
        $('#txtMetaDescription').val('');
        $('#txtPhone').val('');
        $('#txtEmail').val('');
        $('#txtLat').val('');
        $('#txtLng').val('');
        $('#txtWebsite').val('');
        $('#txtAddress').val('');
        $('#ckStatusM').prop('checked', true);
    }

    function registerControls() {
        //gọi ckeditor để hiển thị bật lên
        CKEDITOR.replace('txtContent', {});

        //Fix: cannot click on element ck in modal
        $.fn.modal.Constructor.prototype.enforceFocus = function () {
            $(document)
                .off('focusin.bs.modal') // guard against infinite focus loop
                .on('focusin.bs.modal', $.proxy(function (e) {
                    if (
                        this.$element[0] !== e.target && !this.$element.has(e.target).length
                        // CKEditor compatibility fix start.
                        && !$(e.target).closest('.cke_dialog, .cke').length
                        // CKEditor compatibility fix end.
                    ) {
                        this.$element.trigger('focus');
                    }
                }, this));
        };
    }

    function wrapPaging(recordCount, callBack, changePageSize) {
        var totalsize = Math.ceil(recordCount / structures.configs.pageSize);
        //Unbind pagination if it existed or click change pagesize
        if ($('#paginationUL a').length === 0 || changePageSize === true) {
            $('#paginationUL').empty();
            $('#paginationUL').removeData("twbs-pagination");
            $('#paginationUL').unbind("page");
        }
        //Bind Pagination Event
        $('#paginationUL').twbsPagination({
            totalPages: totalsize,
            visiblePages: 7,
            first: 'Đầu',
            prev: 'Trước',
            next: 'Tiếp',
            last: 'Cuối',
            onPageClick: function (event, p) {
                structures.configs.pageIndex = p;
                setTimeout(callBack(), 200);
            }
        });
    }
};