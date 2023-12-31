public class Booking {
   
    public BookingAccomodation() {
        sc = new Scanner(System.in);
    }

    public void run() {
        loginCheck = false;
        memberLoggedIn = null;
        loadHotel();
        printMenu();
    }

    /*
     * 호텔 정보 불러오기
     *
     * 프로그램에서 활용한 호텔의 정보를 불러오는 함수
     *
     * 호텔 정보 파일이 없으면 불러올 호텔 정보가 없어 프로그램 강제 종료
     */
    private void loadHotel() {
        file = new File(CustomString.PATH_HOTEL);
        if (!file.exists()) {
            System.out.println("호텔 정보가 존재하지 않습니다.");
            System.out.println("프로그램을 종료합니다.");
            System.exit(0);
        }
        try {
            fis = new FileInputStream(file);
            in = new ObjectInputStream(fis);
            hotel = (Hotel) in.readObject();
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        } finally {
            try {
                in.close();
                fis.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /*
     * 호텔 정보 저장하기
     *
     * 변경된 호텔 정보를 저장
     *
     * 폴더가 없으면 자동으로 폴더 생성 후 저장
     */
    private void saveHotel() {
        file = new File(CustomString.PATH_DIRECTORY);
        if (!file.exists()) {
            file.mkdirs();
        }
        file = new File(CustomString.PATH_HOTEL);
        try {
            fos = new FileOutputStream(file);
            out = new ObjectOutputStream(fos);
            out.writeObject(hotel);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                out.close();
                fos.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
    
    /* 
     * 객실 정보 보기
     */

    private void getRoomInfo() { // 객실 정보 보기
        for (int i = 0; i < hotel.getRoomInfos().length; i++) {
            String kitchen;
            if (hotel.getRoomInfos()[i].isKitchen()) {
                kitchen = "유";
            } else {
                kitchen = "무";
            }
            System.out.println("  [방이름] : " + hotel.getRoomInfos()[i].getRoomName() + "룸  " + "  [가격] : "
                    + CustomString.putComma(hotel.getRoomPrices()[i]) + "원  " + "  [기본인원] : "
                    + hotel.getRoomInfos()[i].getDefaultNumberPeople() + "명  " + "  [최대인원] : "
                    + hotel.getRoomInfos()[i].getMaxNumberPeople() + "명  " + "  [화장실] : "
                    + hotel.getRoomInfos()[i].getNumberBathroom() + "개  " + "  [침대] : "
                    + hotel.getRoomInfos()[i].getNumberBed() + "개  " + "  [주방] : " + kitchen);
        }
    }
    
    /* 
     * 예약 변경
     * 
     * 예약변경 시 초기에 기존의 예약을 null값으로 변경
     * 예약정보가 null이 아니면 변경이 불가능
     * 
     * 기존의 예약방식을 다시가져와서 예약
     */

    private void reserveRoom() {
        if (memberLoggedIn.getReservation() != null) {
            System.out.println("예약 추가·변경이 불가능합니다. 관리자에게 문의하세요.");
            return;
        }
        Reservation r = new Reservation();
        setDate(r);
        setRoom(r);
        if (r.getRoom() == null) {
            return;
        }
        setNumberPeople(r);
        setService(r);
        memberLoggedIn.setReservation(r);
        System.out.println("예약이 완료됐습니다.");
        saveHotel();
    }

    /*
     *  변경사항
     *  다른사람이 체크아웃하는 날에 체크인 예약할수있게 하기
     *
     *  오류 수정사항 : 입력값이 숫자가 아니면 예외처리가 뜸 --- 해결완료
     */
    private void setDate(Reservation r) { // 날짜 선택
        LocalDate today = LocalDate.now();
        HotelDate dateCheckIn;
        HotelDate dateCheckOut;
        while (true) {
            System.out.println("체크인 날짜를 입력해주세요. (20190314와 같이 입력해주세요.)");
            String checkIn = sc.nextLine();
            if (!checkIn.matches(
                    "^20(\\d{2})(((0([13578])|1([02]))(0[1-9]|[1-2][0-9]|3[0-1]))|((0([469])|11)(0[1-9]|[1-2][0-9]|30))|(02(0[1-9]|([12])[0-9]$)))")) {
                System.out.println("올바른 날짜를 입력해주세요.");
            } else {
                dateCheckIn = new HotelDate(checkIn);
                if (dateCheckIn.getCheckDate().isBefore(today)) {
                    System.out.println("선택 불가능한 날짜입니다. 다시 입력해주세요.");
                } else {
                    break;
                }
            }
        }

        while (true) {
            System.out.println("체크아웃 날짜를 입력해주세요. (20190314와 같이 입력해주세요.)");
            String checkOut = sc.nextLine();
            if (!checkOut.matches(
                    "^20(\\d{2})(((0([13578])|1([02]))(0[1-9]|[1-2][0-9]|3[0-1]))|((0([469])|11)(0[1-9]|[1-2][0-9]|30))|(02(0[1-9]|([12])[0-9]$)))")) {
                System.out.println("올바른 날짜를 입력해주세요.");
            } else {
                dateCheckOut = new HotelDate(checkOut);
                if (dateCheckOut.getCheckDate().isBefore(today)
                        || dateCheckOut.getCheckDate().isBefore(dateCheckIn.getCheckDate())
                        || dateCheckOut.getCheckDate().isEqual(dateCheckIn.getCheckDate())) {
                    System.out.println("선택 불가능한 날짜입니다. 다시 입력해주세요.");
                } else {
                    break;
                }
            }
        }

        System.out.println("체크인 날짜 : " + dateCheckIn.getCheckDate());
        System.out.println("체크아웃 날짜 : " + dateCheckOut.getCheckDate());

        r.setDateCheckIn(dateCheckIn);
        r.setDateCheckOut(dateCheckOut);

    }

    public void setRoom(Reservation r) {
        Period diff = Period.between(r.getDateCheckIn().getCheckDate(), r.getDateCheckOut().getCheckDate());
        System.out.println("예약 가능 객실 번호");

        List<Room> roomToReserve = new ArrayList<Room>();

        for (int i = 0; i < hotel.getRooms().size(); i++) {
            for (int j = 0; j < hotel.getRooms().get(i).size(); j++) {
                boolean canReserve = true;
                for (String guestId : hotel.getRooms().get(i).get(j).getGuests()) {
                    if (hotel.getRooms().get(i).get(j).getGuests().size() == 0) {
                        break;
                    }
                    LocalDate checkIn = hotel.getMembers().get(guestId).getReservation().getDateCheckIn()
                            .getCheckDate();
                    LocalDate checkOut = hotel.getMembers().get(guestId).getReservation().getDateCheckOut()
                            .getCheckDate();
                    if ((checkIn.isBefore(r.getDateCheckIn().getCheckDate())
                            || checkIn.isEqual(r.getDateCheckIn().getCheckDate()))
                            && checkOut.isAfter(r.getDateCheckIn().getCheckDate())) {
                        canReserve = false;
                        break;
                    } else if (checkIn.isBefore(r.getDateCheckOut().getCheckDate())
                            && (checkOut.isAfter(r.getDateCheckOut().getCheckDate())
                            || checkOut.isEqual(r.getDateCheckOut().getCheckDate()))) {
                        canReserve = false;
                        break;
                    } else if (checkIn.isAfter(r.getDateCheckIn().getCheckDate())
                            && checkOut.isBefore(r.getDateCheckOut().getCheckDate())) {
                        canReserve = false;
                        break;
                    }
                }
                if (canReserve) {
                    roomToReserve.add(hotel.getRooms().get(i).get(j));
                }
            }
            System.out.println();
        }

        for (Room room1 : roomToReserve) {
            System.out.println(room1.getRoomNumber() + "호 ");
        }

        if (roomToReserve.size() == 0) {
            System.out.println("예약 가능한 방이 없습니다.");
            System.out.println("예약을 취소합니다.");
            return;
        }

        Room room;
        while (true) {
            int floor;
            int number;
            System.out.println("예약할 방 번호를 입력해주세요");
            String roomNumber = sc.nextLine();
            if (!roomNumber.matches(CustomString.regex(hotel))) {
                System.out.println("올바른 형식으로 입력하세요.");
                continue;
            } else {
                floor = Integer.parseInt(roomNumber.substring(0, 1)) - 2;
                number = Integer.parseInt(roomNumber.substring(2)) - 1;
            }
            if (number > hotel.getRooms().get(floor).size() - 1) {
                System.out.println("없는 방입니다.");
                continue;
            } else {
                room = hotel.getRooms().get(floor).get(number);
            }

            if (roomToReserve.contains(room)) {
                break;
            } else {
                System.out.println("예약할 수 없는 방입니다.");
                continue;
            }
        }

        room.getGuests().add(memberLoggedIn.getId());
        r.setRoom(room);
        
        for (int k = 0; k < hotel.getRoomInfos().length; k++) {
        	
            if(room.getRoomName().equals(hotel.getRoomInfos()[k].getRoomName())) {
            	
                r.setAmountPaid(r.getAmountPaid() + (hotel.getRoomPrices()[k] * diff.getDays()));
            }
		}        

        System.out.println(
                "숙박일 수 " + diff.getDays() + "박 " + ((int)diff.getDays() + 1) + "일\n숙박 요금 " + CustomString.putComma(r.getAmountPaid()) + "원입니다.");
        
    }

    /*
     * 변경사항 숙박일수 만큼 추가 인원비용 추가
     */
    private void setNumberPeople(Reservation r) {
        String numberPeople;
        int defaultNumberPeople = r.getRoom().getDefaultNumberPeople();
        int maxNumberPeople = r.getRoom().getMaxNumberPeople();
        Period diff = Period.between(r.getDateCheckIn().getCheckDate(), r.getDateCheckOut().getCheckDate());

        while (true) {
            System.out.println("숙박할 인원을 입력해주세요.");
            System.out.printf("선택하신 방의 기본 인원은 %d명, 최대 인원은 %d명입니다.\r\n", defaultNumberPeople, maxNumberPeople);
            System.out.println("인원 추가 시 50,000원이 추가됩니다.");
            numberPeople = sc.nextLine();
            if (!numberPeople.matches("^\\d$")) {
                System.out.println("입력값을 확인해주세요.");
            } else {
                if (Integer.parseInt(numberPeople) > maxNumberPeople) {
                    System.out.println("최대 인원을 초과했습니다.");
                    System.out.println("다시 입력해주세요.");
                } else if (Integer.parseInt(numberPeople) > defaultNumberPeople) {
                    System.out.println("추가 요금은 "
                            + CustomString.putComma((Integer.parseInt(numberPeople) - defaultNumberPeople) * 50000 * diff.getDays())
                            + "원입니다.");
                    break;
                } else {
                    break;
                }
            }
        }

        if (Integer.parseInt(numberPeople) > defaultNumberPeople) {
            r.setAmountPaid(r.getAmountPaid() + (Integer.parseInt(numberPeople) - defaultNumberPeople) * 50000 * diff.getDays());
        }
        r.setNumberPeople(Integer.parseInt(numberPeople));
    }

    /*
     * 변경사항
     *
     * 부가서비스 요금을 숙박 일수에 맞춰 표시 ( 인원 포함 ) 테라피는 몇일 숙박을 하던 단 1회만 받는다.
     */
    private void setService(Reservation r) { // 부가 서비스 선택
        Period diff = Period.between(r.getDateCheckIn().getCheckDate(), r.getDateCheckOut().getCheckDate());
        long breakfast = diff.getDays() * hotel.getBreakfast() * r.getNumberPeople();
        long therapy = hotel.getTherapy() * r.getNumberPeople();
        System.out.println("부가 서비스를 선택해주세요.");
        System.out.println("조식은 일 50,000원, 전신 테라피는 300,000원입니다.");

        while (true) {
            System.out.println("1. 조식 2. 전신 테라피 3. 둘 다 4. 선택 안 함");
            String service = sc.nextLine();
            switch (service) {
                case "1":
                    System.out.println("조식을 선택하셨습니다.");
                    r.setBreakfast(true);
                    System.out.println("추가 요금 : " + CustomString.putComma(breakfast) + "원입니다");
                    r.setAmountPaid(r.getAmountPaid() + breakfast);
                    return;
                case "2":
                    System.out.println("전신 테라피를 선택하셨습니다.");
                    r.setTherapy(true);
                    System.out.println("추가요금 : " + CustomString.putComma(therapy) + "원입니다");
                    r.setAmountPaid(r.getAmountPaid() + therapy);
                    return;
                case "3":
                    System.out.println("조식과 전신 테라피를 선택하셨습니다.");
                    r.setBreakfast(true);
                    r.setTherapy(true);
                    System.out.println("조식 추가요금 : " + CustomString.putComma(breakfast) + "원입니다.");
                    System.out.println("테라피 추가요금 : " + CustomString.putComma(therapy) + "원입니다.");
                    r.setAmountPaid(r.getAmountPaid() + breakfast);
                    r.setAmountPaid(r.getAmountPaid() + therapy);
                    return;
                case "4":
                    System.out.println("서비스를 선택하지 않으셨습니다.");
                    return;
                default:
                    System.out.println("잘못 입력하셨습니다.");
            }
        }
    }

    /*
     * 변경사항
     *
     * 예약 확인 기능에 예약 변경, 예약 취소 기능을 추가함
     */
    private void getReservation() { // 예약 확인
        if (memberLoggedIn.getReservation() == null) {
            System.out.println("예약 기록이 없습니다.");
            return;
        }

        System.out.println(memberLoggedIn.getReservation().checkReservation());

        System.out.println("┎                                  ┒");
        System.out.println("         1. 예약 변경하기");
        System.out.println();
        System.out.println("         2. 예약 취소하기");
        System.out.println();
        System.out.println("         3.  돌아가기");
        System.out.println("┖                                  ┚");
        String select = sc.nextLine();
        switch (select) {
            case "1":
                System.out.println("예약을 변경합니다.");
                changeReservation();
                break;
            case "2":
                System.out.println("예약을 취소합니다.");
                cancelReservation();
            case "3":
                System.out.println("메인 화면으로 돌아갑니다.");
                break;
            default:
                System.out.println("잘못 입력하였습니다.");
                getReservation();
                break;
        }
    }

    /*
     * 변경사항
     *
     * 3일전 안에 예약취소를 하면 null값 나오는 오류 수정
     */
    private void cancelReservation() { // 예약 취소
        Period diff = Period.between(hotel.getToday(), memberLoggedIn.getReservation().getDateCheckIn().getCheckDate());
        if (diff.getDays() < 3) {
            System.out.println("예약 변경·취소는 체크인 3일 전까지만 가능합니다.");
            return;
        }
        memberLoggedIn.getReservation().getRoom().getGuests().remove(memberLoggedIn.getId());
        memberLoggedIn.setReservation(null);
        saveHotel();
        System.out.println("기존 예약이 취소되었습니다.");
    }

    /*
     * 예약 변경 함수
     *
     * 예약 취소 후 예약하기 실행
     */
    private void changeReservation() { // 예약 변경
        cancelReservation();
        reserveRoom();
    }

    /*
     * // 회원 가입 //
     *
     * 회원 가입 후 자동 로그인
     */
   
    /*
     * 메뉴
     *
     * 비로그인 , 로그인 회원의 보이는 메뉴가 다르다. 
     * 회원 가입을 하면 자동 로그인이 됨으로 로그인회원 화면이 보이게 된다.
     */
    private void printMenu() {
        while (true) {
            System.out.println("2조 호텔에 오신걸 환영합니다.");
            System.out.println("┎                                  ┒");
            System.out.println("         1.   객실 보기");
            System.out.println();
            if (!loginCheck) {
                System.out.println("         2.   로그인");
                System.out.println();
                System.out.println("         3.   회원 가입");
                System.out.println();
                System.out.println("         4.   종료 하기");
                System.out.println("┖                                  ┚");
            } else {
                System.out.println("         2. 객실 예약하기");
                System.out.println();
                System.out.println("         3. 예약 확인하기");
                System.out.println();
                System.out.println("         4. 회원 정보 수정");
                System.out.println();
                System.out.println("         5.   종료 하기");
                System.out.println("┖                                  ┚");
                System.out.println(memberLoggedIn.getName() + "님 방문을 환영합니다.");
            }

            String select = sc.nextLine();
            switch (select) {
                case "1":
                    System.out.println("현재 객실 정보 현황 입니다.");
                    getRoomInfo();
                    break;
                case "2":
                    if (!loginCheck) {
                        login();
                    } else {
                        System.out.println("객실 예약입니다.");
                        reserveRoom();
                    }
                    break;
                case "3":
                    if (!loginCheck) {
                        signUp();
                    } else {
                        getReservation();
                    }
                    break;
                case "4":
                    if (!loginCheck) {
                        saveHotel();
                        return;
                    } else {
                        changeInfo();
                    }
                    break;
                case "5":
                    if (!loginCheck) {
                        System.out.println("번호를 잘못 입력했습니다.");
                    } else {
                        saveHotel();
                        return;
                    }
                    break;
                default:
                    System.out.println("번호를 잘못 입력했습니다.");
                    break;
            }
        }
    }
}