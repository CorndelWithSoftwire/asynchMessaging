
# You can find the new timestamped tags here: https://hub.docker.com/r/gitpod/workspace-base/tags
FROM gitpod/workspace-full:latest

# Install custom tools, runtime, etc.
# base image only got `apt` as the package manager
# install-packages is a wrapper for `apt` that helps skip a few commands in the docker env.
RUN sudo install-packages dos2unix

RUN wget -O activeMQ.tar.gz 'https://www.apache.org/dyn/closer.cgi?filename=/activemq/5.17.1/apache-activemq-5.17.1-bin.tar.gz&action=download'

RUN gunzip activeMQ.tar.gz && tar -xvf activeMQ.tar

ENV PATH="/home/gitpod/apache-activemq-5.17.1/bin:$PATH"

