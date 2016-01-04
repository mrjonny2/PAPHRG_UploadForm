$(function(){

	$('#file_field').live('change', function() {
		$("#upload_form").ajaxForm({
			target: '#target',
			success: function() {
	    		console.log('success!');
			}
		}).submit();
	});

})