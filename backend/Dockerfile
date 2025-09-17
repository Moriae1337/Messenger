FROM python:3.13.0-alpine3.20

ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt ./requirements.txt

RUN python -m venv /py && \
    /py/bin/pip install --upgrade pip

RUN /py/bin/pip install -r /requirements.txt

COPY . /backend
WORKDIR /backend

ENV PATH="/py/bin:$PATH"

CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--reload"]