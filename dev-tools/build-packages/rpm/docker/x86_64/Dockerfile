FROM rockylinux:8.5

# Install all the necessary tools to build the packages
RUN yum clean all && yum update -y
RUN yum install -y openssh-clients sudo gnupg \
    yum-utils epel-release redhat-rpm-config rpm-devel \
    zlib zlib-devel rpm-build autoconf automake \
    glibc-devel libtool perl

#RUN yum install -y --nobest https://repo.ius.io/ius-release-el7.rpm  

RUN yum update -y && yum install -y python3

RUN ln -fs /usr/bin/python3.6 /usr/bin/python

# Add the scripts to build the RPM package
ADD builder.sh /usr/local/bin/builder
RUN chmod +x /usr/local/bin/builder

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/builder"]
