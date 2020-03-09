#!perl
use strict;
use warnings;
use v5.10;

my $lin_fmt = qq{%-40s = "\%s"};

open UUIDSFILE, "uuids.txt";
my $service_line;
my @chars;

for my $line (<UUIDSFILE>) {
    my ($uuid, $name) = $line =~ /^([a-f0-9\-]+)\s+(.*)/ or die "malformed line: $line";
    if (lc $name eq 'service') {
        $service_line = sprintf $lin_fmt, 'const SERVICE_UUID_OPERATION', $uuid;
    } else {
        push @chars, sprintf ($lin_fmt,'const CHARACTERISTIC_UUID_'. uc $name, $uuid);
    }
}

die "No service defined" unless $service_line;
die "No characteristics defined" unless @chars;

say '// GATT Services';
say $service_line;
say '';
say '// GATT Characteristics';
say  for @chars;
