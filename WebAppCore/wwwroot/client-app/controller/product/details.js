﻿var ProductDetailController = function () {
    this.initialize = function () {
        registerEvents();
    }

    function registerEvents() {
        $('#btnAddToCart').on('click', function (e) {
            e.preventDefault();
            var id = parseInt($(this).data('id'));
            var colorId = parseInt($('#ddlColorId').val());
            var sizeId = parseInt($('#ddlSizeId').val());
            $.ajax({
                url: '/Cart/AddToCart',
                type: 'post',
                dataType: 'json',
                data: {
                    productId: id,
                    quantity: parseInt($('#txtQuantity').val()),
                    color: colorId,
                    size: sizeId
                },
                success: function () {
                    structures.notify('Sản phẩm đã được thêm vào giỏ hàng', 'success');
                    loadHeaderCart();
                }
            });
        });
    }
    function loadHeaderCart() {
        $("#headerCart").load("/AjaxContent/HeaderCart");
    }
}