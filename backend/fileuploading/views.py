from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.files.storage import FileSystemStorage
from .forms import UploadFileForm
from .models import UploadedFile
import pandas as pd
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import logging


logger = logging.getLogger(__name__) 

def upload_file(request):
    #file_name = None  # Initialize the variable to store the filename
    #html_data = None  # Initialize the variable for HTML data
    
    if request.method == 'POST' and request.FILES['file']:
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = form.cleaned_data['file']
            fs = FileSystemStorage()
            filename = fs.save(uploaded_file.name, uploaded_file)
            uploaded_file_url = fs.url(filename)

            #file_name = uploaded_file.name  # Get the uploaded file name

            # Read the Excel file into a DataFrame
            df = pd.read_excel(uploaded_file)

           
              # Process the last row
            last_row = df.iloc[-1]  # Get the last row
            temperature = last_row.get('TEMPERATURE')  # Replace 'Temperature' with your actual column name

 # Convert the DataFrame to HTML
            data = df.to_dict(orient='records')

            if temperature and temperature > 28:
                    
                try:
                    # Prepare and send the email
                    msg = MIMEMultipart()
                    msg['From'] = 'noreply.twinstruct@gmail.com'
                    msg['To'] = 'farida.oweid@gmail.com'
                    msg['Subject'] = 'Action needed: Room temperature too high in Building XX'
                    message = """Dear Property Manager,

                The room temperature is too high in room XY. Please turn on central air conditioning in Building XX.

                Best regards from TwinStruct"""
                    msg.attach(MIMEText(message, 'plain'))
                    
                    

                    # Email server configuration
                    server = smtplib.SMTP('smtp.gmail.com', 587)
                    server.starttls()
                    server.login('noreply.twinstruct@gmail.com', os.environ.get('EMAIL_PASSWORD')) # Replace with your actual password
                    server.send_message(msg)

                except Exception as e:
                    logger.error("Failed to send email: %s", str(e))
                    return JsonResponse({'error': str(e)}, status=500)
                finally:
                  server.quit()
                return JsonResponse({'success': 'Email sent because temperature is too high.'})
                

            return JsonResponse({'success': 'File processed, but temperature is not too high.'})
        else:
               return JsonResponse({'error': form.errors.as_json()}, status=400)

    return JsonResponse({'error': 'File upload failed.'}, status=400) 

def upload_success(request):
    # Your logic here, for example:
    return HttpResponse("Upload successful!")
