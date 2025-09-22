fn simple_crack(password: u32) {
    let start: std::time::Instant = std::time::Instant::now();
    for i in 1000000u32..10000000u32 {
        if i == password {
            let time: f64 = start.elapsed().as_micros() as f64 / 1000000f64;
            println!("simple_crack took: {time} seconds to crack: {i}");
            return;
        }
    }
}

fn threaded_crack(password: u32, num_threads: u32) {
    let start: std::time::Instant = std::time::Instant::now();
    let chunk_size: u32 = (10000000 - 1000000) / num_threads;

    let mut handles: Vec<std::thread::JoinHandle<Option<u32>>> = vec![];

    for i in 0..num_threads {
        let start_range: u32 = 1000000 + i * chunk_size;
        let end_range: u32 = if i == num_threads - 1 {
            10000000
        } else {
            start_range + chunk_size
        };
        let password: u32 = password;

        let handle: std::thread::JoinHandle<Option<u32>> = std::thread::spawn(move || {
            for n in start_range..end_range {
                if n == password {
                    return Some(n);
                }
            }
            None
        });

        handles.push(handle);
    }

    for handle in handles {
        if let Ok(Some(found)) = handle.join() {
            let time: f64 = start.elapsed().as_secs_f64();
            println!("threaded_crack took: {time} seconds to crack: {found}");
            return;
        }
    }
}

fn main() {
    let password: u32 = 9999999;

    simple_crack(password);
    threaded_crack(password, 8);
}
