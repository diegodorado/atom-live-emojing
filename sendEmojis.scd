(
n  = NetAddr("127.0.0.1",3333);
~dirt.receiveAction = { |e|

    if ( e.at(\emoji).isNil,{e[\emoji]=0},{});

    if ( e.at(\emoji)>0  ,
        {
            n.sendMsg("/emoji", e.at(\emoji),e.at(\cycle),e.at(\cps),e.at(\delta),e.at(\latency),e.at(\z_order));
        },
        {}
    );
}
);
