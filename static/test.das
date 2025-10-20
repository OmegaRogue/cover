options gen2
//options log_stack
//options log_mem
//options log_init
//options log_debug_mem
//options persistent_heap

[persistent]
struct Foo {
	x: int8
	y: int8
}
let shared {
    d: Foo? = new Foo(x=int8(9), y=int8(10));
}



[init]
def init {
	print("{d}\n")
}

[export, unsafe_deref]
def main {
    var a = 1
	var b = 4
	var c = a + b
	print("{c}\n")
	print("Hello World\n")
	print("{d}\n")
	//unsafe {
	//	map_to_array(d, 2) <| $(var arg:array<int8>#):auto {
	//		for (x in each(arg)) {
	//			print("{x}\n")
	//		}
	//	}
	//}
}
